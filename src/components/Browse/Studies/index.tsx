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

const BrowseStudies: React.FC = () => {
  const [page, setPage] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [biome, setBiome] = useQueryParamState('biome', 'root');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [search] = useQueryParamState('search', '');

  const [hasData, setHasData] = useState(false);
  const {
    data: studiesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('studies', {
    page,
    ordering: order,
    lineage: biome,
    page_size: pageSize,
    search: search || undefined,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (study) => study.relationships.biomes.data?.[0]?.id,
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
        id: 'study_id',
        Header: 'Accession',
        accessor: 'attributes.accession',
        Cell: ({ cell }) => (
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Study name',
        accessor: 'attributes.study-name',
      },
      {
        Header: 'Samples',
        accessor: 'attributes.samples-count',
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
    setHasData(!!studiesList);
  }, [studiesList]);
  if (!studiesList && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <div>
        <BiomeSelector
          onSelect={async (biomeSelected) => {
            await setHasData(false);
            setBiome(biomeSelected);
            setPage(1);
            await studiesList;
            setHasData(true);
          }}
          initialValue={biome}
        />
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={studiesList as MGnifyResponseList}
          Title={`Studies (${studiesList.meta.pagination.count})`}
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

export default BrowseStudies;
