import React, { useState, useEffect, useMemo, useCallback } from 'react';

import axios from 'utils/protectedAxios';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import ExtraAnnotations from 'components/ExtraAnnotations';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import config from 'utils/config';
import InfoBanner from 'components/UI/InfoBanner';
import DerivedGenomes from 'components/Assembly/DerivedGenomes';
import AdditionalContainedGenomes from 'components/Assembly/AdditionalContainedGenomes';
import V2AssemblyContext from './context';
import { ErrorFromFetch, ErrorTypes } from 'hooks/data/useData';
import { Assembly } from '@/interfaces';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { ENA_VIEW_URL } from 'utils/urls';
import { Link } from 'react-router-dom';

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
  items: GenomeLink[];
};

const Genomes: React.FC = () => {
  const { genomeLinksLastUpdated, assemblyData } =
    React.useContext(V2AssemblyContext);

  const [showBanner, setShowBanner] = React.useState(true);

  const derivedGenomesAccessions = useMemo(
    () => assemblyData?.genome_links?.map((gl) => gl.genome.accession) || [],
    [assemblyData]
  );

  return (
    <>
      {showBanner && (
        <InfoBanner
          type="success"
          dismissible
          dismissAriaLabel="Dismiss last updated banner"
          onDismiss={() => setShowBanner(false)}
        >
          <p className="vf-banner__text">
            Last updated on:{' '}
            {genomeLinksLastUpdated
              ? new Date(genomeLinksLastUpdated).toLocaleString()
              : 'N/A'}
          </p>
        </InfoBanner>
      )}

      <DerivedGenomes />
      <AdditionalContainedGenomes derivedGenomes={derivedGenomesAccessions} />
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

const AssemblyPage: React.FC = () => {
  const accession = useURLAccession();
  const {
    data: assemblyData,
    error: assemblyError,
    loading: loadingAssembly,
  } = useMgnifyResourceDetail<Assembly>('assemblies', accession || '');
  const [linksData, setLinksData] = useState<AssemblyLinksData | null>(null);
  const [loadingLinks, setLoadingLinks] = useState<boolean>(true);
  const [linksError, setLinksError] = useState<{
    error: unknown;
    type: ErrorTypes;
  } | null>(null);

  const [genomeLinksLastUpdated, setGenomeLinksLastUpdated] = useState<
    string | null
  >(null);

  const fetchData = useCallback(async () => {
    setLoadingLinks(true);
    setLinksError(null);
    if (!accession) return;

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

      setLinksData(normalised);
    } catch (err) {
      setLinksError({
        error: err,
        type: ErrorTypes.FetchError,
      });
    } finally {
      setLoadingLinks(false);
    }
  }, [accession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ctxValue = useMemo(
    () => ({
      assemblyData:
        assemblyData && linksData
          ? {
              accession: assemblyData.accession,
              run_accession: assemblyData.run_accession,
              genome_links: linksData.genome_links,
              sample_accession: assemblyData.sample_accession ?? '',
            }
          : null,
      loading: loadingAssembly || loadingLinks,
      error: (assemblyError || linksError) as ErrorFromFetch,
      refetch: fetchData,
      genomeLinksLastUpdated,
    }),
    [
      assemblyData,
      linksData,
      loadingAssembly,
      loadingLinks,
      assemblyError,
      linksError,
      fetchData,
      genomeLinksLastUpdated,
    ]
  );

  if (loadingLinks || loadingAssembly) return <Loading size="large" />;
  if (linksError) return <FetchError error={linksError as ErrorFromFetch} />;
  if (assemblyError) return <FetchError error={assemblyError} />;
  if (!assemblyData) return <Loading />;

  const tabs = [
    { label: 'Analyses', to: '#analyses' },
    { label: 'Genomes', to: '#genomes' },
    // TODO: Re-enable when we have assembly extra annotations API
    // { label: 'Additional Analyses', to: '#additional-analyses' },
  ];

  const details = [
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${assemblyData?.accession}`}>
          {assemblyData?.accession}
        </ExtLink>
      ),
    },
    {
      key: 'Run',
      // TODO: coassembly
      value: assemblyData?.run_accession
        ? () => (
            <Link
              to={`/runs/${assemblyData.run_accession}`}
              key={assemblyData.run_accession}
            >
              {assemblyData.run_accession}
            </Link>
          )
        : null,
    },
    {
      key: 'Sample',
      // TODO: coassembly
      value: assemblyData?.sample_accession
        ? () => (
            <Link
              to={`/samples/${assemblyData.sample_accession}`}
              key={assemblyData.sample_accession}
            >
              {assemblyData.sample_accession}
            </Link>
          )
        : null,
    },
    {
      key: 'Study (of assembled reads)',
      value: assemblyData?.reads_study_accession
        ? () => (
            <Link
              to={`/studies/${assemblyData.reads_study_accession}`}
              key={assemblyData.reads_study_accession}
            >
              {assemblyData.reads_study_accession}
            </Link>
          )
        : null,
    },
    {
      key: 'Study (of assembly)',
      value: assemblyData?.assembly_study_accession
        ? () => (
            <Link
              to={`/studies/${assemblyData.assembly_study_accession}`}
              key={assemblyData.assembly_study_accession}
            >
              {assemblyData.assembly_study_accession}
            </Link>
          )
        : null,
    },
  ].filter(({ value }) => value) as {
    key: string;
    value: React.FunctionComponent;
  }[];

  return (
    <section className="vf-content">
      <h2>Assembly: {assemblyData?.accession || ''}</h2>
      <Box label="Description">
        <KeyValueList list={details} />
      </Box>

      <Tabs tabs={tabs} />

      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <V2AssemblyContext.Provider value={ctxValue}>
            <RouteForHash hash="#analyses" isDefault>
              <Analyses />
            </RouteForHash>

            <RouteForHash hash="#genomes">
              <Genomes />
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

export default AssemblyPage;
