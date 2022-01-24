/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import BiomeSelector from 'components/UI/BiomeSelector';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';

const BrowseSamples: React.FC = () => {
  const [queryParameters, setQueryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      biome: 'root',
      page_size: 25,
      search: '',
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: samplesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('samples', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    lineage: queryParameters.biome as string,
    page_size: queryParameters.page_size as number,
    search: (queryParameters.search as string) || undefined,
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
      <BiomeSelector
        onSelect={async (biome) => {
          await setHasData(false);
          setQueryParameters({
            ...queryParameters,
            biome,
            page: 1,
          });
          await samplesList;
          setHasData(true);
        }}
        initialValue={queryParameters.biome as string}
      />
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={samplesList as MGnifyResponseList}
          title={`Samples (${samplesList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
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
