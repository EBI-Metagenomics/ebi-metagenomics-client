import React from 'react';

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
      {/* Enhanced Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="vf-table" style={{ margin: 0 }}>
          <thead className="vf-table__header">
            <tr
              className="vf-table__row"
              style={{ backgroundColor: '#f1f3f4' }}
            >
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '120px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  🔗 Accession
                  <button
                    onClick={() => onSortChange('acc')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {sortField === 'acc'
                      ? sortDirection === 'asc'
                        ? '⬆️'
                        : '⬇️'
                      : '↕️'}
                  </button>
                </div>
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '80px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  🧬 Type
                  <button
                    onClick={() => onSortChange('assay_type')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {sortField === 'assay_type'
                      ? sortDirection === 'asc'
                        ? '⬆️'
                        : '⬇️'
                      : '↕️'}
                  </button>
                </div>
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '100px' }}
              >
                📊 cANI
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '100px' }}
              >
                📈 Containment
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '120px' }}
              >
                🌍 Location
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '120px' }}
              >
                🦠 Metagenome
              </th>
              <th
                className="vf-table__heading"
                scope="col"
                style={{ minWidth: '120px' }}
              >
                ⚙️ Actions
              </th>
            </tr>
          </thead>
          <tbody className="vf-table__body">
            {processResults().paginatedResults.map(
              (entry: any, index: number) => {
                // Calculate actual index in the full dataset
                const actualIndex = (currentPage - 1) * itemsPerPage + index;

                return (
                  <tr
                    key={actualIndex}
                    className="vf-table__row"
                    style={{
                      backgroundColor:
                        actualIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = '#e3f2fd';
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor =
                        actualIndex % 2 === 0 ? '#fff' : '#f9f9f9';
                    }}
                  >
                    <td className="vf-table__cell">
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
                    </td>
                    <td className="vf-table__cell">
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor:
                            entry.assay_type === 'WGS' ? '#d4edda' : '#fff3cd',
                          color:
                            entry.assay_type === 'WGS' ? '#155724' : '#856404',
                        }}
                      >
                        {entry.assay_type}
                      </span>
                    </td>
                    <td className="vf-table__cell">
                      <div
                        style={{
                          fontWeight: 'bold',
                          color:
                            typeof entry.cANI === 'number' && entry.cANI > 0.95
                              ? '#28a745'
                              : '#6c757d',
                        }}
                      >
                        {typeof entry.cANI === 'number'
                          ? entry.cANI.toFixed(3)
                          : entry.cANI}
                      </div>
                    </td>
                    <td className="vf-table__cell">
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
                            color:
                              typeof entry.containment === 'number' &&
                              entry.containment > 0.5
                                ? '#28a745'
                                : '#6c757d',
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
                    </td>
                    <td className="vf-table__cell">
                      <div style={{ fontSize: '14px' }}>
                        {entry.geo_loc_name_country_calc === 'uncalculated' ? (
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f8d7da',
                              color: '#721c24',
                              fontWeight: 'bold',
                            }}
                          >
                            Uncalculated
                          </span>
                        ) : (
                          <span>{entry.geo_loc_name_country_calc || '—'}</span>
                        )}
                      </div>
                    </td>
                    <td className="vf-table__cell">
                      <span style={{ fontSize: '14px' }}>
                        {entry.organism || '—'}
                      </span>
                    </td>
                    <td className="vf-table__cell">
                      <div style={{ display: 'flex', gap: '8px' }}>
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
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
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
