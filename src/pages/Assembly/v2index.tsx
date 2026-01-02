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
import AdditionalContainedGenomes from 'components/Assembly/AdditionalContianedGenomes';
import V2AssemblyContext from './context';
import { ErrorTypes } from 'hooks/data/useData';

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

const Overview: React.FC = () => {
  const { genomeLinksLastUpdated } = React.useContext(V2AssemblyContext);

  const [showBanner, setShowBanner] = React.useState(true);

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
        `${config.dev_api_v2}assemblies/${accession}/genome-links`
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
