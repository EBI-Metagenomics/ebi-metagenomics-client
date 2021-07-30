/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { useMGnifyData } from 'hooks/useMGnifyData';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import useQueryParamState from 'hooks/useQueryParamState';
import BiomeSelector from 'components/UI/BiomeSelector';

function getOrderingQueryParamFromSortedColumn(tableSortBy: any): string {
  if (!tableSortBy.length) return '';
  const col = tableSortBy[0];
  return `${col.desc ? '-' : ''}${col.id
    .replace(/attributes./g, '')
    .replace(/-/g, '_')}`;
}

const Browse: React.FC = () => {
  const [pageQuery, setPageQuery] = useQueryParamState('page', 1);
  const [orderingQuery, setOrderingQuery] = useQueryParamState('order', '');
  const [biomeFilter, setBiomeFilter] = useQueryParamState('biome', 'root');

  const [hasData, setHasData] = useState(false);
  const { data: studiesList } = useMGnifyData('studies', {
    page: Number(pageQuery),
    ordering: orderingQuery,
    lineage: biomeFilter,
    page_size: 10,
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
          setPageQuery(1);
          setBiomeFilter(biome);
          await studiesList;
          setHasData(true);
        }}
        initialValue={biomeFilter}
      />
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={studiesList}
          title={`Studies (${studiesList.meta.pagination.count})`}
          fetchPage={(pageIndex) => {
            setPageQuery(pageIndex + 1);
          }}
          onChangeSort={(sortBy) =>
            setOrderingQuery(getOrderingQueryParamFromSortedColumn(sortBy))
          }
          initialPage={Number(pageQuery) - 1}
        />
      )}
    </section>
  );
};

export default Browse;
