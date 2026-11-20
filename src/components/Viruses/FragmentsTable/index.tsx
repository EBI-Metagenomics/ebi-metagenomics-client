import React, { useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import useApiData from '@/hooks/data/useApiData';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { PaginatedList, ViralFragment } from '@/interfaces';
import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import UserContext from 'pages/Login/UserContext';

const { usePage, usePageSize, useOrder, useSearch, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

const columns: ColumnDef<ViralFragment>[] = [
  {
    header: 'Accession',
    accessorKey: 'accession',
    cell: ({ row }) => (
      <Link
        to={`/viral-catalogues/${row.original.catalogue_id}/fragments/${row.original.accession}`}
      >
        {row.original.accession}
      </Link>
    ),
  },
  { header: 'Cluster size', accessorKey: 'cluster_size', enableSorting: false },
  { header: 'Length (bp)', accessorKey: 'length' },
  {
    header: 'CheckV quality',
    accessorKey: 'checkv_quality',
    enableSorting: false,
  },
  {
    header: 'Completeness',
    accessorKey: 'completeness',
    cell: ({ row }) =>
      row.original.completeness == null
        ? 'Unknown'
        : `${row.original.completeness}%`,
  },
  {
    header: 'Type',
    accessorKey: 'sequence_type',
    cell: ({ row }) =>
      row.original.sequence_type === 'prophage' ? 'Prophage' : 'Virus',
    enableSorting: false,
  },
  {
    header: 'Source',
    accessorKey: 'source_type',
    cell: ({ row }) =>
      (row.original.source_types ?? [row.original.source_type])
        .map((source) => (source === 'genome' ? 'Genome' : 'Assembly analysis'))
        .join(', '),
    enableSorting: false,
  },
  {
    header: 'Representative detections',
    accessorKey: 'occurrence_count',
    enableSorting: false,
  },
  {
    header: 'Member detections',
    accessorKey: 'cluster_member_occurrence_count',
    enableSorting: false,
  },
];

const FragmentsTable: React.FC<{ catalogueId: string }> = ({ catalogueId }) => {
  const { config } = useContext(UserContext);
  const [page, setPage] = usePage<number>();
  const [pageSize] = usePageSize<number>();
  const [order] = useOrder<string>();
  const [search] = useSearch<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const source = searchParams.get('source_type') || '';
  const cluster = searchParams.get('cluster_representative') || '';
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    order: order || '',
    search: search || '',
  });
  if (source) params.set('source_type', source);
  ['sequence_type', 'is_provirus', 'representatives_only'].forEach((name) => {
    if (searchParams.has(name)) params.set(name, searchParams.get(name)!);
  });
  if (cluster) params.set('cluster_representative', cluster);
  const { data, loading, error, stale, download } = useApiData<
    PaginatedList<ViralFragment>
  >({
    url: `${config.api_v2}viruses/catalogues/${catalogueId}/fragments?${params}`,
  });
  if (error) return <FetchError error={error} />;
  if (!data && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <h3>Viral cluster representatives</h3>
      <label className="vf-form__label" htmlFor="viral-source">
        Source
      </label>
      <select
        id="viral-source"
        className="vf-form__select"
        value={source}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams);
          if (event.target.value) next.set('source_type', event.target.value);
          else next.delete('source_type');
          next.delete('page');
          setPage(1);
          setSearchParams(next);
        }}
      >
        <option value="">All sources</option>
        <option value="genome">Genome</option>
        <option value="analysis">Assembly analysis</option>
      </select>
      {cluster && (
        <p>
          Cluster: {cluster}.{' '}
          <Link to={`/viral-catalogues/${catalogueId}`}>
            Show all fragments
          </Link>
        </p>
      )}
      <EMGTable
        cols={columns}
        data={data ?? { items: [], count: 0 }}
        initialPage={page - 1}
        expectedPageSize={pageSize}
        horizontalScroll
        toolbarOutsideTable
        sortable
        showTextFilter
        loading={loading}
        isStale={stale}
        onDownloadRequested={download}
      />
    </section>
  );
};

export default withQueryParamProvider(FragmentsTable);
