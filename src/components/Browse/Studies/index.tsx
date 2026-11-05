import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import useStudiesList from 'hooks/data/useStudies';
import BiomeSelector from 'components/UI/BiomeSelector';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import FetchError from 'components/UI/FetchError';
import { Study } from '@/interfaces';

const { usePage, useSearch, useOrder, useBiome, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseStudies: React.FC = () => {
  const [page, setPage] = usePage<number>();
  const [order] = useOrder<string>();
  const [biome] = useBiome<string>();
  const [search] = useSearch<string>();

  const [hasData, setHasData] = useState(false);

  const {
    data: studiesList,
    loading,
    download,
    error,
  } = useStudiesList({
    page,
    order,
    biome_lineage: biome,
    search,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        header: 'Biome',
        accessorFn: (study) => study.biome?.lineage,
        cell: ({ cell }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.getValue())}`}
            style={{ float: 'initial' }}
          />
        ),
        enableSorting: false,
        meta: { className: 'mg-biome' },
      },
      {
        id: 'accession',
        header: 'Accession',
        accessorKey: 'accession',
        cell: ({ cell }) => (
          <Link to={`/studies/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        header: 'Study name',
        accessorKey: 'title',
        enableSorting: false,
      },
      {
        header: 'Last updated',
        accessorKey: 'updated_at',
        cell: ({ cell }) => (
          <>{new Date(cell.getValue()).toLocaleDateString()}</>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!studiesList);
  }, [studiesList]);

  if (!studiesList && loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  return (
    <section className="mg-browse-section">
      <div>
        <BiomeSelector
          onSelect={async () => {
            await setHasData(false);
            setPage(1);
            await studiesList;
            setHasData(true);
          }}
        />
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable<Study>
          cols={columns}
          data={studiesList ?? []}
          Title={`Studies (${studiesList?.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          onDownloadRequested={download}
          showTextFilter
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseStudies);
