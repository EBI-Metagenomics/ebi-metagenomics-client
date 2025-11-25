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
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { Link } from 'react-router-dom';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import { ENA_VIEW_URL } from 'utils/urls';
import ExtraAnnotations from 'components/ExtraAnnotations';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import config from 'utils/config';
import EMGTable from 'components/UI/EMGTable';

// Normalised data type for this page
type AssemblyLinksData = {
  accession: string;
  genome_links: GenomeLink[];
  run_accession?: React.ReactNode;
  sample_accession?: string | (() => JSX.Element);
};

// Alternative API response shapes
type ItemsResponse = {
  items: Array<{
    genome: GenomeLink['genome'];
    species_rep: string;
  }>;
  count?: number;
};

type GenomeLink = {
  genome: {
    accession: string;
    taxon_lineage: string;
    catalogue_id: string | number;
    catalogue_version: string | number;
  };
  species_rep: string;
};

type ContainedGenome = {
  genome: {
    accession: string;
    taxon_lineage: string;
    catalogue_id: string | number;
    catalogue_version: string | number;
  };
  ena: string;
  containment: number; // percentage (0-100)
};

type V2AssemblyCtx = {
  assemblyData: {
    accession: string;
    run_accession: React.ReactNode | undefined;
    genome_links: GenomeLink[];
    sample_accession: (() => JSX.Element) | string;
  } | null;
  loading: boolean;
  error: { error: unknown; type: ErrorTypes } | null;
  refetch: () => Promise<void>;
};

const V2AssemblyContext = createContext<V2AssemblyCtx>({
  assemblyData: null,
  loading: false,
  error: null,
  refetch(): Promise<void> {
    return Promise.resolve(undefined);
  },
});

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
        row.genome.accession === row.species_rep ? (
          <span
            className="icon icon-common icon-check-circle"
            style={{ fontSize: '1.3rem', color: 'green' }}
          />
        ) : (
          ''
        ),
    },
    {
      id: 'species_representative',
      Header: 'Species representative',
      accessor: (row: GenomeLink) => (
        <Link to={`/genomes/${row.species_rep}`}>{row.species_rep}</Link>
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
  // Mock data until API is available
  const mockData: ContainedGenome[] = [
    {
      genome: {
        accession: 'MGYG000356011GCA_000876',
        taxon_lineage: 'Gramella',
        catalogue_id: 'Marine',
        catalogue_version: '1.0',
      },
      ena: '',
      containment: 99.9,
    },
    {
      genome: {
        accession: 'MGYG000004193GCA_000111',
        taxon_lineage: 'HTCC2207',
        catalogue_id: 'Non-model fish gut',
        catalogue_version: '2.0',
      },
      ena: '',
      containment: 52.0,
    },
  ];

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
      accessor: (row: ContainedGenome) => row.ena,
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
      <EMGTable cols={columns} data={mockData} />
    </Box>
  );
};

const Overview: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const details = [
    {
      key: 'Sample',
      value: assemblyData
        ? () => (
            <Link to={`${assemblyData?.sample_accession}`}>
              {assemblyData?.sample_accession}
            </Link>
          )
        : null,
    },
    {
      key: 'Runs',
      value: assemblyData
        ? () => (
            <Link to={`${assemblyData?.run_accession}`}>
              {assemblyData?.run_accession}
            </Link>
          )
        : null,
    },
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${assemblyData?.accession}`}>
          {assemblyData?.accession}
        </ExtLink>
      ),
    },
  ].filter(({ value }) => Boolean(value));

  return (
    <>
      <Box label="Description">
        <KeyValueList list={details} />
      </Box>
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

const isItemsResponse = (raw: unknown): raw is ItemsResponse => {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    Array.isArray((raw as Record<string, unknown>).items)
  );
};

const isAssemblyLinksData = (raw: unknown): raw is AssemblyLinksData => {
  if (typeof raw !== 'object' || raw === null) return false;
  const obj = raw as Record<string, unknown>;
  return typeof obj.accession === 'string' && Array.isArray(obj.genome_links);
};

const hasDataField = <T,>(raw: unknown): raw is MGnifyResponseObj<T> => {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'data' in (raw as Record<string, unknown>)
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.api_v2}/assemblies/${accession}/genome-links`
      );
      // Normalise API response to the structure expected by the UI components
      // Expected shape:
      // {
      //   accession: string,
      //   genome_links: Array<{ genome: { accession, taxon_lineage, catalogue_id, catalogue_version }, species_rep: string }>,
      //   run_accession?: React.ReactNode,
      //   sample_accession?: string
      // }
      const raw: unknown = response.data;
      let normalised: AssemblyLinksData | null = null;
      if (isItemsResponse(raw)) {
        // Newer/alternative API returns { items: [...], count }
        normalised = {
          accession,
          genome_links: raw.items.map((it) => ({
            genome: it.genome,
            species_rep: it.species_rep,
          })),
          run_accession: undefined,
          sample_accession: '',
        };
      } else if (hasDataField<AssemblyLinksData>(raw)) {
        // MGnifyResponseObj style
        normalised = raw.data;
      } else if (isAssemblyLinksData(raw)) {
        normalised = raw;
      }
      setData(normalised);
      setLoading(false);
    } catch (err) {
      setError({
        error: err,
        type: ErrorTypes.FetchError,
      });
      setLoading(false);
    }
  }, [accession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // data is already normalised in fetchData
  const assemblyData = data;

  const ctxValue = useMemo(
    () => ({ assemblyData, loading, error, refetch: fetchData }),
    [assemblyData, loading, error, fetchData]
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
