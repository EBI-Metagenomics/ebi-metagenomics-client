import React from 'react';
import { Column } from 'react-table';

// Column definition factory for Branchwater/Metagenome results.
// This is shared between Branchwater and Genome pages so that the
// results are rendered consistently.
export const getBranchwaterResultColumns = (): Column<any>[] => [
  {
    Header: 'Accession',
    accessor: 'acc',
    disableSortBy: true,
    Cell: ({ row }) => {
      const entry = row.original as any;
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
            <span style={{ fontFamily: 'monospace' }}>{entry.acc}</span>
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
      const entry = row.original as any;
      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: entry.assay_type === 'WGS' ? '#d4edda' : '#fff3cd',
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
      return (
        <div style={{ fontWeight: 'bold' }}>
          {typeof entry.cANI === 'number' ? entry.cANI.toFixed(3) : entry.cANI}
        </div>
      );
    },
  },
  {
    Header: 'Containment',
    accessor: 'containment',
    Cell: ({ row }) => {
      const entry = row.original as any;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ fontWeight: 'bold' }}>
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
      const entry = row.original as any;
      return <span>{entry.bioproject}</span>;
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
      return <span style={{ fontSize: '14px' }}>{entry.organism || '—'}</span>;
    },
  },
];

export default getBranchwaterResultColumns;
