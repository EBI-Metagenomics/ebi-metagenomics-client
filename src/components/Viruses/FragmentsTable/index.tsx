import React, { useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import useApiData from '@/hooks/data/useApiData';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { PaginatedList, ViralFragment } from '@/interfaces';
import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import UserContext from 'pages/Login/UserContext';
import 'pages/Search/style.css';

const { usePage, usePageSize, useOrder, useSearch, withQueryParamProvider } =
  createSharedQueryParamContextForTable();
const columns: ColumnDef<ViralFragment>[] = [
  {
    header: 'Accession',
    accessorKey: 'accession',
    cell: ({ row }) => (
      <Link
        to={`/viruses/${row.original.catalogue_id}/fragments/${row.original.accession}`}
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
    header: 'Completeness (%)',
    accessorKey: 'completeness',
    cell: ({ getValue }) => getValue() ?? 'Unknown',
  },
  {
    header: 'Contamination (%)',
    accessorKey: 'contamination',
    cell: ({ getValue }) => getValue() ?? 'Unknown',
  },
  { header: 'Type', accessorKey: 'sequence_type', enableSorting: false },
  {
    header: 'Source',
    id: 'sources',
    accessorFn: (row) =>
      (row.source_types ?? [])
        .map((source) => (source === 'genome' ? 'Genome' : 'Assembly analysis'))
        .join(', '),
    enableSorting: false,
  },
];

const FragmentsTable: React.FC<{
  catalogueId: string;
  kind?: 'viruses' | 'plasmids';
}> = ({ catalogueId, kind = 'viruses' }) => {
  const { config } = useContext(UserContext);
  const [page, setPage] = usePage<number>();
  const [pageSize] = usePageSize<number>();
  const [order] = useOrder<string>();
  const [search] = useSearch<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams({
    kind,
    page: String(page),
    page_size: String(pageSize),
    order: order || '',
    search: search || '',
  });
  [
    'source_type',
    'sequence_type',
    'completeness_min',
    'completeness_max',
    'contamination_min',
    'contamination_max',
    'length_min',
    'length_max',
  ].forEach((name) => {
    if (searchParams.has(name)) params.set(name, searchParams.get(name)!);
  });
  const { data, loading, error, stale, download } = useApiData<
    PaginatedList<ViralFragment>
  >({
    url: `${config.api_v2}viruses/catalogues/${catalogueId}/fragments?${params}`,
  });
  const update = (values: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  };
  if (error) return <FetchError error={error} />;
  if (!data && loading) return <Loading />;
  const ranges: [string, string, number][] =
    kind === 'viruses'
      ? [
          ['completeness', 'Completeness (%)', 100],
          ['contamination', 'Contamination (%)', 100],
          ['length', 'Length (bp)', 1000000],
        ]
      : [['length', 'Length (bp)', 1000000]];
  return (
    <section className="mg-page-search">
      <h3>
        {kind === 'plasmids' ? 'Plasmid' : 'Viral'} cluster representatives
      </h3>
      <div className="vf-grid mg-grid-search">
        <aside
          className="vf-stack vf-stack--400"
          aria-label="Representative filters"
        >
          <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
            <legend className="vf-form__legend">Source</legend>
            <select
              id="viral-source"
              aria-label="Source"
              className="vf-form__select"
              value={searchParams.get('source_type') || ''}
              onChange={(event) => update({ source_type: event.target.value })}
            >
              <option value="">All sources</option>
              <option value="genome">Genome</option>
              <option value="analysis">Assembly analysis</option>
            </select>
          </fieldset>
          {ranges.map(([field, label, maximum]) => {
            const enabled =
              searchParams.has(`${field}_min`) ||
              searchParams.has(`${field}_max`);
            return (
              <fieldset
                key={field}
                className="vf-form__fieldset vf-stack vf-stack--200"
              >
                <legend className="vf-form__legend">{label}</legend>
                <Switch
                  controlled
                  id={`${field}-filter`}
                  isOn={enabled}
                  onChange={(on) =>
                    update({
                      [`${field}_min`]: on ? '0' : '',
                      [`${field}_max`]: on ? String(maximum) : '',
                    })
                  }
                />
                <Slider
                  min={0}
                  max={maximum}
                  isEnabled={enabled}
                  selection={{
                    min: Number(searchParams.get(`${field}_min`) || 0),
                    max: Number(searchParams.get(`${field}_max`) || maximum),
                  }}
                  onChange={({ min, max }) =>
                    update({
                      [`${field}_min`]: String(min),
                      [`${field}_max`]: String(max),
                    })
                  }
                />
              </fieldset>
            );
          })}
        </aside>
        <div style={{ minWidth: 0 }}>
          <EMGTable
            cols={
              kind === 'plasmids'
                ? columns.filter(
                    (column) =>
                      !('accessorKey' in column) ||
                      ![
                        'checkv_quality',
                        'completeness',
                        'contamination',
                      ].includes(String(column.accessorKey))
                  )
                : columns
            }
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
        </div>
      </div>
    </section>
  );
};
export default withQueryParamProvider(FragmentsTable);
