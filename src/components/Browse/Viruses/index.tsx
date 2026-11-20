import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import useApiData from '@/hooks/data/useApiData';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { PaginatedList, ViralCatalogue } from '@/interfaces';
import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import UserContext from 'pages/Login/UserContext';
import { formatDate } from 'utils/genomes';

const { usePage, usePageSize, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

const columns: ColumnDef<ViralCatalogue>[] = [
  {
    header: 'Catalogue',
    accessorKey: 'name',
    cell: ({ row }) => (
      <Link to={`/viral-catalogues/${row.original.catalogue_id}`}>
        {row.original.name}
      </Link>
    ),
  },
  { header: 'Biome', accessorKey: 'biome' },
  { header: 'Version', accessorKey: 'version' },
  { header: 'Viral fragments', accessorKey: 'fragment_count' },
  { header: 'Clusters', accessorKey: 'cluster_count' },
  {
    header: 'Updated',
    accessorKey: 'updated_at',
    cell: ({ row }) => formatDate(row.original.updated_at),
  },
];

const BrowseViruses: React.FC = () => {
  const { config } = useContext(UserContext);
  const [page] = usePage<number>();
  const [pageSize] = usePageSize<number>();
  const { data, loading, error, stale, download } = useApiData<
    PaginatedList<ViralCatalogue>
  >({
    url: `${config.api_v2}viruses/catalogues/?page=${page}&page_size=${pageSize}`,
  });
  if (error) return <FetchError error={error} />;
  if (!data && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <h3>Viral catalogues</h3>
      <p>
        Browse viral fragments from metagenome-assembled genomes and assembly
        analyses. Each catalogue includes cluster representatives, quality
        estimates and taxonomic assignments.
      </p>
      <EMGTable
        cols={columns}
        data={data ?? { items: [], count: 0 }}
        initialPage={page - 1}
        expectedPageSize={pageSize}
        horizontalScroll
        toolbarOutsideTable
        loading={loading}
        isStale={stale}
        onDownloadRequested={download}
      />
    </section>
  );
};

export default withQueryParamProvider(BrowseViruses);
