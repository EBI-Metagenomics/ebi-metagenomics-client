/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import BiomeSelector from 'components/UI/BiomeSelector';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';

const Browse: React.FC = () => {
  const [queryParameters, setQueryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      biome: 'root',
      page_size: 25,
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: studiesList,
    loading,
    isStale,
  } = useMGnifyData('studies', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    lineage: queryParameters.biome as string,
    page_size: queryParameters.page_size as number,
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

  return (
    <section className="vf-content">
      <h2>Browse Page.</h2>
      <BiomeSelector
        onSelect={async (biome) => {
          await setHasData(false);
          setQueryParameters({
            ...queryParameters,
            biome,
            page: 1,
          });
          await studiesList;
          setHasData(true);
        }}
        initialValue={queryParameters.biome as string}
      />
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={studiesList as MGnifyResponseList}
          title={`Studies (${studiesList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
        />
      )}
    </section>
  );
};

export default Browse;
