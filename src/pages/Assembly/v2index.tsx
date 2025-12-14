import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useCallback,
} from 'react';

import axios from 'utils/protectedAxios';
import { MGnifyResponseObj, ErrorTypes } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import { Link } from 'react-router-dom';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import { ENA_VIEW_URL } from 'utils/urls';
import ExtraAnnotations from 'components/ExtraAnnotations';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import config from 'utils/config';
import EMGTable from 'components/UI/EMGTable';
import InfoBanner from 'components/UI/InfoBanner';

// ---------- Types ----------

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

// Normalised data type for this page
type AssemblyLinksData = {
  accession: string;
  genome_links: GenomeLink[];
  run_accession?: React.ReactNode;
  sample_accession?: string;
};

type GenomeLinksResponse = {
  count?: number;
  items: GenomeLink[]; // matches the actual response you pasted
};

type ContainedGenome = {
  genome: {
    accession: string;
    taxon_lineage: string;
    catalogue_id: string | number;
    catalogue_version: string | number;
  };
  ena_genome_accession?: string;
  containment: number; // percentage (0-100)
};

type V2AssemblyCtx = {
  assemblyData: {
    accession: string;
    run_accession: React.ReactNode | undefined;
    genome_links: GenomeLink[];
    sample_accession: string;
  } | null;
  loading: boolean;
  error: { error: unknown; type: ErrorTypes } | null;
  refetch: () => Promise<void>;
  genomeLinksLastUpdated: string | null;
};

const V2AssemblyContext = createContext<V2AssemblyCtx>({
  assemblyData: null,
  loading: false,
  error: null,
  refetch(): Promise<void> {
    return Promise.resolve(undefined);
  },
  genomeLinksLastUpdated: null,
});

// ---------- Components ----------

const DerivedGenomes: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const columns = [
    {
      id: 'genome_accession',
      Header: 'Genome accession',
      accessor: (row: GenomeLink) => (
        <Link to={`/genomes/${row.genome.accession}`}>
          {row.genome.accession}
        </Link>
      ),
    },
    {
      id: 'ena',
      Header: 'ENA',
      accessor: (row: GenomeLink) =>
        row.mag_accession ? (
          // If mag_accession is an ENA/Browser-friendly accession, link it:
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
          <span
            className="icon icon-common icon-check-circle"
            style={{ fontSize: '1.3rem', color: 'green' }}
            title="Species representative"
          />
        ) : (
          <span title="Not species representative">—</span>
        ),
    },
    {
      id: 'taxonomy',
      Header: 'Taxonomy',
      accessor: (row: GenomeLink) => row.genome.taxon_lineage,
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: (row: GenomeLink) =>
        `${row.genome.catalogue_id} v${row.genome.catalogue_version}`,
    },
  ];

  const genomeLinks = assemblyData?.genome_links ?? [];

  return (
    <Box label="Derived genomes">
      {genomeLinks.length ? (
        <EMGTable cols={columns} data={genomeLinks} />
      ) : (
        <p>No derived genomes found.</p>
      )}
    </Box>
  );
};

const AdditionalContainedGenomes: React.FC = () => {
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
          `${config.api_v2}assemblies/${accession}/additional-contained-genomes`
        );

        const raw = resp.data as unknown;
        const items =
          raw && typeof raw === 'object' && Array.isArray((raw as any).items)
            ? ((raw as any).items as Array<any>)
            : [];

        const mapped: ContainedGenome[] = items.map((it) => ({
          genome: {
            accession: it?.genome?.accession ?? '',
            taxon_lineage: it?.genome?.taxon_lineage ?? '',
            catalogue_id: it?.genome?.catalogue_id ?? '',
            catalogue_version: it?.genome?.catalogue_version ?? '',
          },
          ena_genome_accession: it?.genome?.ena_genome_accession ?? '',
          containment:
            typeof it?.containment === 'number' ? it.containment * 100 : 0,
        }));

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
  }, [accession]);

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
      accessor: (row: ContainedGenome) => `${row.containment.toFixed(1)}%`,
    },
    {
      id: 'taxonomy',
      Header: 'Taxonomy',
      accessor: (row: ContainedGenome) => row.genome.taxon_lineage,
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: (row: ContainedGenome) =>
        `${row.genome.catalogue_id} v${row.genome.catalogue_version}`,
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
        <p style={{ margin: 0 }}>
          Genomes that were not derived from this assembly but have at least 50%
          of their sequence contained in the assembly.
        </p>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={(e) => e.preventDefault()}
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

const Overview: React.FC = () => {
  const { genomeLinksLastUpdated } = React.useContext(V2AssemblyContext);

  return (
    <>
      <InfoBanner type="success">
        <p className="vf-banner__text">
          Last updated on:{' '}
          {genomeLinksLastUpdated
            ? new Date(genomeLinksLastUpdated).toLocaleString()
            : 'N/A'}
        </p>
      </InfoBanner>

      <DerivedGenomes />
      <AdditionalContainedGenomes />
    </>
  );
};

const Analyses: React.FC = () => {
  return (
    <Box label="Associated analyses">
      <AssociatedAnalyses rootEndpoint="assemblies" />
    </Box>
  );
};

const AdditionalAnalyses: React.FC = () => {
  return (
    <Box label="Additional analyses">
      <p>
        Additional annotations produced by workflows run outside the scope of
        MGnify&apos;s versioned pipelines.
      </p>
      <ExtraAnnotations namespace="assemblies" />
    </Box>
  );
};

const V2AssemblyPage: React.FC = () => {
  const accession = useURLAccession();

  const [data, setData] = useState<AssemblyLinksData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    error: unknown;
    type: ErrorTypes;
  } | null>(null);

  const [genomeLinksLastUpdated, setGenomeLinksLastUpdated] = useState<
    string | null
  >(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<GenomeLinksResponse>(
        `${config.api_v2}assemblies/${accession}/genome-links`
      );
      const { items } = response.data;
      setGenomeLinksLastUpdated(items?.[0]?.updated_at ?? null);
      const normalised: AssemblyLinksData = {
        accession,
        genome_links: items.map((it) => ({
          genome: it.genome,
          species_rep: it.species_rep,
          mag_accession: it.mag_accession,
          updated_at: it.updated_at,
        })),
        run_accession: undefined,
        sample_accession: '',
      };

      setData(normalised);
    } catch (err) {
      setError({
        error: err,
        type: ErrorTypes.FetchError,
      });
    } finally {
      setLoading(false);
    }
  }, [accession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assemblyData = data;

  const ctxValue = useMemo(
    () => ({
      assemblyData: assemblyData
        ? {
            accession: assemblyData.accession,
            run_accession: assemblyData.run_accession,
            genome_links: assemblyData.genome_links,
            sample_accession: assemblyData.sample_accession ?? '',
          }
        : null,
      loading,
      error,
      refetch: fetchData,
      genomeLinksLastUpdated,
    }),
    [assemblyData, loading, error, fetchData, genomeLinksLastUpdated]
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Analyses', to: '#analyses' },
    // TODO: Re-enable when we have assembly extra annotations API
    // { label: 'Additional Analyses', to: '#additional-analyses' },
  ];

  return (
    <section className="vf-content">
      <h2>Assembly: {assemblyData?.accession || ''}</h2>
      <Tabs tabs={tabs} />

      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <V2AssemblyContext.Provider value={ctxValue}>
            <RouteForHash hash="#overview" isDefault>
              <Overview />
            </RouteForHash>

            <RouteForHash hash="#analyses">
              <Analyses />
            </RouteForHash>

            <RouteForHash hash="#additional-analyses">
              <AdditionalAnalyses />
            </RouteForHash>
          </V2AssemblyContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default V2AssemblyPage;
