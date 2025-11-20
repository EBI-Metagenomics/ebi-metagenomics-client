import React, { useEffect } from 'react';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
// Shape of a single Branchwater result row used by this table
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
}

const DetailedResultsTable: React.FC<DetailedResultsTableProps> = ({
  processResults,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  // Synchronize EMGTable internal pagination (via query param) with parent state
  const [emgPage] = useQueryParamState(
    'branchwater-detailed-page',
    currentPage || 1,
    Number
  );
  useEffect(() => {
    if (typeof emgPage === 'number' && emgPage !== currentPage) {
      onPageChange(emgPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emgPage]);

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
          const columns: Column<BranchwaterResult>[] = [
            {
              Header: 'Accession',
              accessor: 'acc',
              disableSortBy: true,
              Cell: ({ row }) => {
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
              Header: 'Assay Type',
              accessor: 'assay_type',
              disableSortBy: true,
              Cell: ({ row }) => {
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
              Header: 'cANI',
              accessor: 'cANI',
              Cell: ({ row }) => {
                const entry = row.original;
                return (
                  <div
                    style={{
                      fontWeight: 'bold',
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
                        ? entry.containment.toFixed(3)
                        : entry.containment}
                    </div>
                  </div>
                );
              },
            },
            {
              Header: 'Bioproject',
              accessor: 'bioproject',
              Cell: ({ row }) => {
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

            // {
            //   Header: 'Collection Date',
            //   accessor: 'collection_date_sam',
            //   Cell: ({ row }) => {
            //     const entry = row.original as any;
            //     return <span>{entry.collection_date_sam}</span>;
            //   },
            // },
            {
              Header: 'Location',
              accessor: 'geo_loc_name_country_calc',
              Cell: ({ row }) => {
                const entry = row.original;
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
            // {
            //   Header: 'Lat/Lng',
            //   accessor: 'lat_lon',
            //   disableSortBy: true,
            //   Cell: ({ row }) => {
            //     const entry = row.original as any;
            //     return <span>{entry.lat_lon}</span>;
            //   },
            // },
            {
              Header: 'Metagenome',
              accessor: 'organism',
              Cell: ({ row }) => {
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
              namespace="branchwater-detailed-"
              sortable
            />
          );
        })()}
      </div>
    </div>
  );
};

export default DetailedResultsTable;
