import React, { useEffect } from 'react';
import EMGTable from 'components/UI/EMGTable';
import { ColumnDef as Column } from '@tanstack/react-table';
import { camelCase } from 'lodash-es';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

interface BranchwaterResult {
  acc: string;
  assay_type: string;
  bioproject?: string;
  cANI: number | string;
  collection_date_sam?: string;
  containment: number | string;
  geo_loc_name_country_calc?: string;
  organism?: string;
  exists_on_mgnify?: boolean;
}

interface ProcessedResults {
  filteredResults: BranchwaterResult[];
  sortedResults: BranchwaterResult[];
  paginatedResults: BranchwaterResult[];
  totalPages: number;
}

interface DetailedResultsTableProps {
  processResults: () => ProcessedResults;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  order: string;
  namespace?: string;
}

const DetailedResultsTable: React.FC<DetailedResultsTableProps> = ({
  processResults,
  currentPage,
  itemsPerPage,
  onPageChange,
  onSortChange,
  order,
  namespace = 'branchwaterDetailed',
}) => {
  // Synchronize EMGTable internal pagination (via query param) with parent state
  const [emgPage] = useQueryParamState(camelCase(`${namespace} page`));
  const [emgOrder] = useQueryParamState(camelCase(`${namespace} order`));

  useEffect(() => {
    if (typeof emgPage === 'number' && emgPage !== currentPage) {
      onPageChange(emgPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emgPage]);

  useEffect(() => {
    if (emgOrder && emgOrder !== order) {
      onSortChange(emgOrder as string);
    }
  }, [emgOrder, onSortChange, order]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Enhanced Table using EMGTable */}
      <div style={{ overflowX: 'auto' }}>
        {(() => {
          const columns: Column<BranchwaterResult, any>[] = [
            {
              header: 'Accession',
              accessorKey: 'acc',
              cell: ({ row }) => {
                const entry = row.original;
                return (
                  <div>
                    {entry.exists_on_mgnify === true ? (
                      <div>
                        <a
                          href={`https://www.ebi.ac.uk/metagenomics/runs/${entry.acc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vf-link"
                          style={{ fontWeight: 'bold' }}
                        >
                          {entry.acc}
                        </a>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#28a745',
                            fontWeight: 'bold',
                            marginTop: '2px',
                          }}
                        >
                          ✅ Available in MGnify
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'monospace' }}>
                        {entry.acc}
                      </span>
                    )}
                  </div>
                );
              },
            },
            {
              header: 'ENA',
              accessorKey: 'acc_ena',
              enableSorting: false,
              cell: ({ row }) => {
                const entry = row.original;
                const enaBase = 'https://www.ebi.ac.uk/ena/browser/view/';
                const href = `${enaBase}${entry.acc}`;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vf-link"
                  >
                    View on ENA
                  </a>
                );
              },
            },
            {
              header: 'Assay Type',
              accessorKey: 'assay_type',
              cell: ({ row }) => {
                const entry = row.original;
                return (
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor:
                        entry.assay_type === 'WGS' ? '#d4edda' : '#fff3cd',
                      color: entry.assay_type === 'WGS' ? '#155724' : '#856404',
                    }}
                  >
                    {entry.assay_type}
                  </span>
                );
              },
            },
            {
              header: 'cANI',
              accessorKey: 'cANI',
              cell: ({ row }) => {
                const entry = row.original;
                return (
                  <div
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {typeof entry.cANI === 'number'
                      ? entry.cANI.toFixed(2)
                      : entry.cANI}
                  </div>
                );
              },
            },
            {
              header: 'Containment',
              accessorKey: 'containment',
              cell: ({ row }) => {
                const entry = row.original;
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {typeof entry.containment === 'number'
                        ? entry.containment.toFixed(2)
                        : entry.containment}
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Bioproject',
              accessorKey: 'bioproject',
              cell: ({ row }) => {
                const entry = row.original;
                const { bioproject } = entry;
                if (!bioproject) {
                  return <span>—</span>;
                }
                return (
                  <a
                    href={`https://www.ebi.ac.uk/ena/browser/view/${bioproject}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vf-link"
                  >
                    {bioproject}
                  </a>
                );
              },
            },
            {
              header: 'Location',
              accessorKey: 'geo_loc_name_country_calc',
              cell: ({ row }) => {
                const entry = row.original;
                const raw = entry.geo_loc_name_country_calc;
                const normalized = (raw || '').toString().trim().toLowerCase();
                const isNotProvided =
                  normalized === '' ||
                  normalized === 'np' ||
                  normalized === 'uncalculated';

                return (
                  <div style={{ fontSize: '14px' }}>
                    {isNotProvided ? 'Not provided' : <span>{raw}</span>}
                  </div>
                );
              },
            },
            {
              header: 'Metagenome',
              accessorKey: 'organism',
              cell: ({ row }) => {
                const entry = row.original;
                return (
                  <span style={{ fontSize: '14px' }}>
                    {entry.organism || '—'}
                  </span>
                );
              },
            },
          ];
          const { paginatedResults, sortedResults } = processResults();
          return (
            <EMGTable
              cols={columns}
              data={{ items: paginatedResults, count: sortedResults.length }}
              className="vf-table"
              showPagination
              expectedPageSize={itemsPerPage}
              initialPage={Math.max(0, (currentPage || 1) - 1)}
              namespace={namespace}
              sortable
            />
          );
        })()}
      </div>
    </div>
  );
};

export default DetailedResultsTable;
