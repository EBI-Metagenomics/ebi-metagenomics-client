/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import BiomeSelector from 'components/UI/BiomeSelector';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const BrowseSamples: React.FC = () => {
  const [page, setPage] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [biome, setBiome] = useQueryParamState('biome', 'root');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [search] = useQueryParamState('search', '');

  const [hasData, setHasData] = useState(false);
  const {
    data: samplesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('samples', {
    page: page as number,
    ordering: order as string,
    lineage: biome as string,
    page_size: pageSize as number,
    search: (search as string) || undefined,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (sample) => sample.relationships.biome.data?.id,
        Cell: ({ cell }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
            style={{ float: 'initial' }}
          />
        ),
        disableSortBy: true,
        className: 'mg-biome',
      },
      {
        Header: 'Accession',
        accessor: 'attributes.accession',
        Cell: ({ cell }) => (
          <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Sample name',
        accessor: 'attributes.sample-name',
      },
      {
        Header: 'Description',
        accessor: 'attributes.sample-desc',
        disableSortBy: true,
      },
      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'attributes.last-update',
        Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!samplesList);
  }, [samplesList]);
  if (!samplesList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      <div>
        <BiomeSelector
          onSelect={async (newBiome) => {
            await setHasData(false);
            setBiome(newBiome);
            setPage(1);
            await samplesList;
            setHasData(true);
          }}
          initialValue={biome}
        />
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={samplesList as MGnifyResponseList}
          Title={`Samples (${samplesList.meta.pagination.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          showTextFilter
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseSamples;
