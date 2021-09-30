/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import BiomeSelector from 'components/UI/BiomeSelector';

function getOrderingQueryParamFromSortedColumn(
  tableSortBy: Array<{ id: string; desc: boolean }>
): string {
  if (!tableSortBy.length) return '';
  const col = tableSortBy[0];
  return `${col.desc ? '-' : ''}${col.id
    .replace(/attributes./g, '')
    .replace(/-/g, '_')}`;
}

const Browse: React.FC = () => {
  const [queryParameters, setQueryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      biome: 'root',
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const { data: studiesList } = useMGnifyData('studies', {
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
      },
      {
        id: 'accession',
        Header: 'Accession',
        accessor: 'attributes.accession',
        Cell: ({ cell, row }) => (
          <a href={row.original.links.self} className="vf-link">
            {cell.value}
          </a>
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
          onChangeSort={(sortBy) => {
            const order = getOrderingQueryParamFromSortedColumn(sortBy);
            if (order === queryParameters.order) return;
            setQueryParameters({
              ...queryParameters,
              order,
              page: 1,
            });
          }}
          initialPage={(queryParameters.page as number) - 1}
        />
      )}
    </section>
  );
};

export default Browse;
