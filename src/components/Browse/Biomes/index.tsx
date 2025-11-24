import React, { useEffect, useState } from 'react';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseList } from '@/hooks/data/useData';
import { getBiomeIcon } from '@/utils/biomes';
import Loading from 'components/UI/Loading';
import Link from 'components/UI/Link';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';

const {
  useBiomesPage,
  useBiomesPageSize,
  useBiomesOrder,
  useBiomesSearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable('biomes', {
  biomesSearch: SharedTextQueryParam(''),
});

const BrowseBiomes: React.FC = () => {
  const [page] = useBiomesPage<number>();
  const [order] = useBiomesOrder<string>();
  const [pageSize] = useBiomesPageSize<number>();
  const [search] = useBiomesSearch<string>();
  const [hasData, setHasData] = useState(false);
  const {
    data: biomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('biomes', {
    page,
    ordering: order,
    page_size: pageSize,
    search: (search as string) || '',
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: '',
        accessor: 'id',
        Cell: ({ cell }) => (
          <span className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`} />
        ),
        disableSortBy: true,
        className: 'mg-biome',
      },
      {
        id: 'biome_name',
        Header: 'Biome name and lineage',
        accessor: (biome) => ({
          lineage: biome.attributes.lineage,
          name: biome.attributes['biome-name'],
        }),
        Cell: ({ cell }) => (
          <>
            <Link to="/browse/studies" state={{ biome: cell.value.lineage }}>
              {cell.value.name}
            </Link>
            <br />
            {cell.value.lineage}
          </>
        ),
      },
      {
        Header: 'Samples excluding sub-lineages',
        id: 'samples_count',
        accessor: (biome) => ({
          lineage: biome.attributes.lineage,
          count: biome.attributes['samples-count'],
        }),
        Cell: ({ cell }) => (
          <Link to={`/browse/samples?biome=${cell.value.lineage}`}>
            {cell.value.count}
          </Link>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!biomesList);
  }, [biomesList]);
  if (!biomesList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={biomesList as MGnifyResponseList}
          Title={`Biomes (${biomesList.meta.pagination.count})`}
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

export default withQueryParamProvider(BrowseBiomes);
