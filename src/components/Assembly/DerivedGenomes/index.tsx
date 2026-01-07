import React from 'react';
import Box from 'components/UI/Box';
import EMGTable from 'components/UI/EMGTable';
import { Link } from 'react-router-dom';
import { ENA_VIEW_URL } from 'utils/urls';
import V2AssemblyContext from 'pages/Assembly/context';
import { cleanTaxLineage, getSimpleTaxLineage } from 'utils/taxon';
import Tooltip from 'components/UI/Tooltip';

type GenomeLink = {
  genome: {
    accession: string;
    taxon_lineage: string;
    catalogue_id: string | number;
    catalogue_version: string | number;
  };
  species_rep: string;
  mag_accession?: string;
  updated_at?: string;
};

const DerivedGenomes: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const downloadCSV = () => {
    const genomeLinks = assemblyData?.genome_links ?? [];
    if (!genomeLinks.length) return;

    // CSV headers
    const header = [
      'genome_accession',
      'ena_accession',
      'species_representative',
      'taxonomy',
      'catalogue',
      'updated_at',
    ];

    const escapeCsv = (val: unknown): string => {
      const s = val === undefined || val === null ? '' : String(val);
      if (/[",\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const rows = genomeLinks.map((row: GenomeLink) => [
      row.genome.accession,
      row.mag_accession ?? '',
      row.genome.accession === row.species_rep ? 'Yes' : 'No',
      row.genome.taxon_lineage,
      `${String(row.genome.catalogue_id).split('-v')[0]} v${
        row.genome.catalogue_version
      }`,
      new Date(row.updated_at || '').toLocaleDateString(),
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const acc = assemblyData?.accession || 'assembly';
    a.href = url;
    a.download = `${acc}-derived-genomes.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      id: 'genome_accession',
      Header: 'Genome accession',
      accessor: (row: GenomeLink) => row.genome.accession,
    },
    {
      id: 'ena',
      Header: 'ENA',
      accessor: (row: GenomeLink) =>
        row.mag_accession ? (
          <a
            href={`${ENA_VIEW_URL}${row.mag_accession}`}
            target="_blank"
            rel="noreferrer"
          >
            {row.mag_accession}
          </a>
        ) : (
          '—'
        ),
    },
    {
      id: 'species_representative',
      Header: 'Species representative',
      accessor: (row: GenomeLink) =>
        row.genome.accession === row.species_rep ? (
          <>
            <Link to={`/genomes/${row.genome.accession}`}>
              {row.genome.accession}
            </Link>
            <span
              className="icon icon-common icon-check-circle"
              style={{ fontSize: '1.3rem', color: 'green', marginLeft: '5px' }}
              title="The species representative is available on MGnify. Click to view"
            />
          </>
        ) : (
          <span title="Not species representative">—</span>
        ),
    },
    {
      Header: 'Taxonomy',
      accessor: (row: GenomeLink) => row.genome.taxon_lineage,
      Cell: ({ cell }) => (
        <>
          {getSimpleTaxLineage(cell.value, true)}{' '}
          <Tooltip content={cleanTaxLineage(cell.value, ' > ')}>
            <sup>
              <span className="icon icon-common icon-info" />
            </sup>
          </Tooltip>
        </>
      ),
      disableSortBy: true,
    },
    {
      id: 'catalogue',
      Header: 'Genome Catalogue',
      accessor: (row: GenomeLink) =>
        `${String(row.genome.catalogue_id).split('-v')[0]} v${
          row.genome.catalogue_version
        }`,
    },
  ];

  const genomeLinks = (assemblyData?.genome_links ?? []) as GenomeLink[];

  return (
    <Box label="Derived genomes">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div />
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={(e) => {
            e.preventDefault();
            downloadCSV();
          }}
          disabled={!genomeLinks.length}
        >
          Download
        </button>
      </div>

      {genomeLinks.length ? (
        <EMGTable cols={columns} data={genomeLinks} />
      ) : (
        <p>No derived genomes found.</p>
      )}
    </Box>
  );
};

export default DerivedGenomes;
