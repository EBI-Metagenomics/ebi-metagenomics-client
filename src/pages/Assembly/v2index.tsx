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

type V2AssemblyCtx = {
  assemblyData: {
    accession: any;
    run_accession: React.ReactNode | undefined;
    genome_links: [];
    sample_accession: (() => JSX.Element) | string;
  } | null;
  loading: boolean;
  error: ErrorTypes;
  refetch: () => Promise<void>;
};

const V2AssemblyContext = createContext<V2AssemblyCtx>({
  assemblyData: null,
  loading: false,
  error: null,
  refetch: async () => {},
});

const DerivedGenomes: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const columns = [
    {
      id: 'genome_accession',
      Header: 'Genome accession',
      accessor: (row: any) => (
        <Link to={`/genomes/${row.genome.accession}`}>
          {row.genome.accession}
        </Link>
      ),
    },
    {
      id: 'ena',
      Header: 'ENA',
      accessor: (row: any) =>
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
      accessor: (row: any) => (
        <Link to={`/genomes/${row.species_rep}`}>{row.species_rep}</Link>
      ),
    },
    {
      id: 'taxonomy',
      Header: 'Taxonomy',
      accessor: (row: any) => row.genome.taxon_lineage,
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: (row: any) =>
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

const Overview: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const details = [
    {
      key: 'Sample',
      value: assemblyData
        ? () => (
            <>
              <Link to={`${assemblyData?.sample_accession}`}>
                {assemblyData?.sample_accession}
              </Link>
            </>
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.api_v2}/assemblies/${accession}`
      );
      setData(response.data);
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

  const assemblyData = (data as MGnifyResponseObj | null)?.data ?? data;

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
