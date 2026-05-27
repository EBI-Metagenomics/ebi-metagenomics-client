import React, { useEffect, useState } from 'react';

import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import { getBiomeIcon } from '@/utils/biomes';
import Loading from 'components/UI/Loading';
import Link from 'components/UI/Link';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useBiomesList from '@/hooks/data/useBiomes';
import { Biome } from '@/interfaces';

const {
  useBiomesPage,
  useBiomesPageSize,
  useBiomesSearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable('biomes', {
  biomesSearch: SharedTextQueryParam(''),
});

const BrowseBiomes: React.FC = () => {
  const [page] = useBiomesPage<number>();
  const [pageSize] = useBiomesPageSize<number>();
  const [search, setSearch] = useBiomesSearch<string>();
  const [hasData, setHasData] = useState(false);
  const {
    data: biomesList,
    loading,
    stale: isStale,
    download: downloadURL,
  } = useBiomesList({
    page,
    page_size: pageSize,
    biome_lineage: (search as string) || '',
  });

  const columns: Column<Biome>[] = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: '',
        accessor: 'lineage',
        Cell: ({ cell }) => (
          <span className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`} />
        ),
        disableSortBy: true,
        className: 'mg-biome',
      },
      {
        id: 'biome_name',
        Header: 'Biome name and lineage',
        accessor: (row: Biome) => row,
        Cell: ({ cell }) => (
          <>
            <Link
              to={`/browse/studies?biome=${encodeURIComponent(
                cell.value.lineage
              )}`}
            >
              {cell.value.biome_name}
            </Link>
            <br />
            {cell.value.lineage}
          </>
        ),
        disableSortBy: true,
      },
      {
        Header: 'Show sub-lineages',
        id: 'sublineages',
        accessor: 'lineage',
        Cell: ({ cell }) => (
          <button
            type="button"
            className="vf-button vf-button--sm vf-button--link mg-button"
            onClick={() => setSearch(cell.value)}
          >
            Show sub-lineages
          </button>
        ),
      },
    ],
    [setSearch]
  );

  useEffect(() => {
    setHasData(!!biomesList);
  }, [biomesList]);
  if (!biomesList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      {search && (
        <div className="vf-banner vf-banner--alert">
          <div className="vf-sidebar vf-sidebar--end">
            <div className="vf-sidebar__inner">
              <div>
                <p style={{ textAlign: 'right' }}>
                  Showing sub-lineages of <strong>{search}</strong>
                </p>
              </div>
              <div>
                <button
                  type="button"
                  className="vf-button vf-button--sm vf-button--tertiary mg-button"
                  onClick={() => setSearch('')}
                >
                  Show all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {hasData && (
        <EMGTable<Biome>
          cols={columns}
          data={biomesList?.items ?? []}
          Title={`Biomes (${biomesList?.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          onDownloadRequested={downloadURL}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseBiomes);
