import React, { useEffect, useState } from 'react';
import Box from 'components/UI/Box';
import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import { Link } from 'react-router-dom';
import axios from 'utils/protectedAxios';
import config from 'utils/config';
import { ENA_VIEW_URL } from 'utils/urls';
import useURLAccession from 'hooks/useURLAccession';
import { cleanTaxLineage, getSimpleTaxLineage } from 'utils/taxon';
import Tooltip from 'components/UI/Tooltip';

type ContainedGenome = {
  genome: {
    accession: string;
    taxon_lineage: string;
    catalogue_id: string | number;
    catalogue_version: string | number;
  };
  ena_genome_accession?: string;
  containment: number;
  cani: number;
  updated_at?: string;
};

interface AdditionalContainedGenomesProps {
  derivedGenomes?: string[];
}

const AdditionalContainedGenomes: React.FC<AdditionalContainedGenomesProps> = ({
  derivedGenomes = [],
}) => {
  const accession = useURLAccession();
  const [rows, setRows] = useState<ContainedGenome[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAdditional = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await axios.get(
          `${config.dev_api_v2}assemblies/${accession}/additional-contained-genomes`
        );

        const raw = resp.data as unknown;
        const items =
          raw && typeof raw === 'object' && Array.isArray((raw as any).items)
            ? ((raw as any).items as Array<any>)
            : [];

        const mapped: ContainedGenome[] = items
          .map((it) => ({
            genome: {
              accession: it?.genome?.accession ?? '',
              taxon_lineage: it?.genome?.taxon_lineage ?? '',
              catalogue_id: it?.genome?.catalogue_id ?? '',
              catalogue_version: it?.genome?.catalogue_version ?? '',
            },
            ena_genome_accession: it?.genome?.ena_genome_accession ?? '',
            containment:
              typeof it?.containment === 'number' ? it.containment * 100 : 0,
            cani: typeof it?.cani === 'number' ? it.cani * 100 : 0,
            updated_at: it?.updated_at ?? '',
          }))
          .filter(
            (it) =>
              it.containment > 50 &&
              !derivedGenomes.includes(it.genome.accession)
          );

        if (!cancelled) setRows(mapped);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setError('Failed to fetch additional contained genomes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAdditional();
    return () => {
      cancelled = true;
    };
  }, [accession, derivedGenomes]);

  const downloadCSV = () => {
    if (!rows.length) return;

    const header = [
      'genome_accession',
      'ena_accession',
      'containment',
      'cani',
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

    const dataRows = rows.map((row) => [
      row.genome.accession,
      row.ena_genome_accession ?? '',
      `${row.containment.toFixed(2)}%`,
      `${row.cani.toFixed(2)}%`,
      row.genome.taxon_lineage,
      `${String(row.genome.catalogue_id).split('-v')[0]} v${
        row.genome.catalogue_version
      }`,
      new Date(row.updated_at || '').toLocaleDateString(),
    ]);

    const csv = [header, ...dataRows]
      .map((r) => r.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accession}-additional-contained-genomes.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      id: 'genome_accession',
      Header: 'Genome accession',
      accessor: (row: ContainedGenome) => (
        <Link to={`/genomes/${row.genome.accession}`}>
          {row.genome.accession}
        </Link>
      ),
    },
    {
      id: 'ena',
      Header: 'ENA',
      accessor: (row: ContainedGenome) =>
        row.ena_genome_accession ? (
          <a
            href={`${ENA_VIEW_URL}${row.ena_genome_accession}`}
            target="_blank"
            rel="noreferrer"
          >
            {row.ena_genome_accession}
          </a>
        ) : (
          '—'
        ),
    },
    {
      id: 'containment',
      Header: 'Containment',
      accessor: (row: ContainedGenome) => `${row.containment.toFixed(2)}%`,
    },
    {
      id: 'cani',
      Header: 'cANI',
      accessor: (row: ContainedGenome) => `${row.cani.toFixed(2)}%`,
    },
    {
      id: 'taxonomy',
      Header: 'Taxonomy',
      accessor: (row: ContainedGenome) => row.genome.taxon_lineage,
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
    },
    {
      id: 'catalogue',
      Header: 'Genome Catalogue',
      accessor: (row: ContainedGenome) =>
        `${String(row.genome.catalogue_id).split('-v')[0]} v${
          row.genome.catalogue_version
        }`,
    },
  ];

  return (
    <Box label="Additional contained genomes">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <details className="vf-details">
          <summary className="vf-details--summary">More info</summary>
          <p className="vf-text-body vf-text-body--3">
            Additional contained genomes were identified by calculating the
            containment of all species-representative genomes from the{' '}
            <Link to={'/branchwater-search'}>MGnify Genomes</Link> catalogues in
            the assembly using <Link to={'/browse/genomes'}>Branchwater</Link>.
            Genomes with ≥50% containment are reported.
          </p>
        </details>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={(e) => {
            e.preventDefault();
            downloadCSV();
          }}
          disabled={!rows.length}
        >
          Download
        </button>
      </div>

      {loading ? (
        <Loading size="small" />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <EMGTable cols={columns} data={rows} />
      )}
    </Box>
  );
};

export default AdditionalContainedGenomes;
