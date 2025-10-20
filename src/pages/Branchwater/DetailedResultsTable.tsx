import React from 'react';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';

interface Filters {
  acc: string;
  assay_type: string;
  bioproject: string;
  cANI: string;
  collection_date_sam: string;
  containment: string;
  geo_loc_name_country_calc: string;
  organism: string;
}

interface ProcessedResults {
  filteredResults: any[];
  sortedResults: any[];
  paginatedResults: any[];
  totalPages: number;
}

interface DetailedResultsTableProps {
  isOpen: boolean;
  onToggleOpen: () => void;

  filters: Filters;
  onFilterChange: (field: keyof Filters, value: string) => void;

  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;

  processResults: () => ProcessedResults;

  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const DetailedResultsTable: React.FC<DetailedResultsTableProps> = ({
  sortField,
  sortDirection,
  onSortChange,
  processResults,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
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
          const columns: Column<any>[] = [
            {
              Header: 'Accession',
              accessor: 'acc',
              Cell: ({ row }) => {
                const entry = row.original as any;
                const actualIndex =
                  (currentPage - 1) * itemsPerPage + row.index;
                return (
                  <div>
                    {actualIndex < 2 ? (
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
              Header: 'Type',
              accessor: 'assay_type',
              Cell: ({ row }) => {
                const entry = row.original as any;
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
              Header: 'cANI',
              accessor: 'cANI',
              Cell: ({ row }) => {
                const entry = row.original as any;
                const isHigh =
                  typeof entry.cANI === 'number' && entry.cANI > 0.95;
                return (
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: isHigh ? '#28a745' : '#6c757d',
                    }}
                  >
                    {typeof entry.cANI === 'number'
                      ? entry.cANI.toFixed(3)
                      : entry.cANI}
                  </div>
                );
              },
            },
            {
              Header: 'Containment',
              accessor: 'containment',
              Cell: ({ row }) => {
                const entry = row.original as any;
                const isHigh =
                  typeof entry.containment === 'number' &&
                  entry.containment > 0.5;
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
                        color: isHigh ? '#28a745' : '#6c757d',
                      }}
                    >
                      {typeof entry.containment === 'number'
                        ? entry.containment.toFixed(3)
                        : entry.containment}
                    </div>
                    {typeof entry.containment === 'number' &&
                      entry.containment > 0.7 && (
                        <span style={{ fontSize: '12px' }}>🔥</span>
                      )}
                  </div>
                );
              },
            },
            {
              Header: 'Location',
              accessor: 'geo_loc_name_country_calc',
              Cell: ({ row }) => {
                const entry = row.original as any;
                return (
                  <div style={{ fontSize: '14px' }}>
                    {entry.geo_loc_name_country_calc === 'uncalculated' ? (
                      'Uncalculated'
                    ) : (
                      <span>{entry.geo_loc_name_country_calc || '—'}</span>
                    )}
                  </div>
                );
              },
            },
            {
              Header: 'Metagenome',
              accessor: 'organism',
              Cell: ({ row }) => {
                const entry = row.original as any;
                return (
                  <span style={{ fontSize: '14px' }}>
                    {entry.organism || '—'}
                  </span>
                );
              },
            },
            {
              Header: 'Actions',
              id: 'actions',
              Cell: ({ row }) => {
                const entry = row.original as any;
                return (
                  <div>
                    <button
                      className="vf-button vf-button--tertiary vf-button--xs"
                      onClick={() =>
                        window.open(
                          `https://www.ebi.ac.uk/metagenomics/runs/${entry.acc}`,
                          '_blank'
                        )
                      }
                      title="View run in MGnify"
                    >
                      Open
                    </button>
                    {entry.biosample_link && (
                      <button
                        className="vf-button vf-button--tertiary vf-button--xs"
                        onClick={() =>
                          window.open(entry.biosample_link, '_blank')
                        }
                        title="View biosample"
                      >
                        Sample
                      </button>
                    )}
                  </div>
                );
              },
            },
          ];
          return (
            <EMGTable
              cols={columns}
              data={processResults().paginatedResults}
              showPagination={false}
              className="vf-table"
            />
          );
        })()}
      </div>

      {/* Enhanced Pagination */}
      {processResults().totalPages > 1 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #dee2e6',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(
                currentPage * itemsPerPage,
                processResults().filteredResults.length
              )}{' '}
              of {processResults().filteredResults.length} results
            </div>
            <nav className="vf-pagination" aria-label="Pagination">
              <ul className="vf-pagination__list">
                <li
                  className={`vf-pagination__item vf-pagination__item--previous-page ${
                    currentPage === 1 ? 'vf-pagination__item--is-disabled' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="vf-pagination__link"
                    onClick={() =>
                      currentPage > 1 && onPageChange(currentPage - 1)
                    }
                  >
                    ⬅️ Previous
                  </button>
                </li>

                {[...Array(Math.min(5, processResults().totalPages))].map(
                  (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > processResults().totalPages) return null;

                    return (
                      <li
                        key={pageNum}
                        className={`vf-pagination__item ${
                          pageNum === currentPage
                            ? 'vf-pagination__item--is-active'
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="vf-pagination__link"
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                )}

                <li
                  className={`vf-pagination__item vf-pagination__item--next-page ${
                    currentPage === processResults().totalPages
                      ? 'vf-pagination__item--is-disabled'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="vf-pagination__link"
                    onClick={() =>
                      currentPage < processResults().totalPages &&
                      onPageChange(currentPage + 1)
                    }
                  >
                    Next ➡️
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedResultsTable;
