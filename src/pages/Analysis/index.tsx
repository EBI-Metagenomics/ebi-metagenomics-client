import React, { useMemo } from 'react';

import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseObj } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview';
import QualityControl from 'components/Analysis/QualityControl';
import ContigViewer from 'components/Analysis/ContigViewer';
import TaxonomySubpage from 'components/Analysis/AmpliconTaxonomy';
import FunctionalSubpage from 'components/Analysis/Functional';
import PathwaysSubpage from 'components/Analysis/Pathways';
import RouteForHash from 'components/Nav/RouteForHash';
import { Link } from 'react-router-dom';
import Downloads from 'components/Downloads';
import Abundance from 'components/Analysis/Abundance';
import AnalysisContext from './AnalysisContext';

const hasAbundance = (
  includes: { attributes?: { 'group-type'?: string } }[]
): boolean => {
  return includes.some(
    (included) => included?.attributes?.['group-type'] === 'Statistics'
  );
};

const isAssembly = (data: MGnifyDatum): boolean =>
  ['assembly', 'hybrid_assembly'].includes(
    data.attributes['experiment-type'] as string
  );
const isAtleastVersion5 = (data: MGnifyDatum): boolean =>
  Number(data.attributes['pipeline-version']) >= 5;
const isNotAmplicon = (data: MGnifyDatum): boolean =>
  data.attributes['experiment-type'] !== 'amplicon';

const AnalysisPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`analyses/${accession}`, {
    include: 'downloads',
  });
  const value = useMemo(
    () => ({ overviewData: data?.data, included: data?.included ?? {} }),
    [data]
  );
  if (loading || !accession) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: analysisData, included } = data as MGnifyResponseObj;

  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Quality control', to: '#qc' },
    { label: 'Taxonomic analysis', to: '#taxonomic' },
    isNotAmplicon(analysisData)
      ? { label: 'Functional analysis', to: '#functional' }
      : null,
    included && hasAbundance(included)
      ? { label: 'Abundance and comparison', to: '#abundance' }
      : null,
    isAssembly(analysisData) && isAtleastVersion5(analysisData)
      ? { label: 'Pathways/Systems', to: '#path-systems' }
      : null,
    isAssembly(analysisData) && isAtleastVersion5(analysisData)
      ? { label: 'Contig Viewer', to: '#contigs-viewer' }
      : null,
    { label: 'Download', to: '#download' },
  ].filter(Boolean) as { label: string; to: string }[];
  const linkToOtherAnalyses = isAssembly(analysisData)
    ? `/assemblies/${analysisData?.relationships?.assembly?.data?.id}`
    : `/runs/${analysisData?.relationships?.run?.data?.id}`;
  return (
    <section className="vf-content">
      <h2>Analysis {accession}</h2>
      {linkToOtherAnalyses && (
        <h4>
          <Link to={linkToOtherAnalyses}>
            <i className="icon icon-common icon-arrow-circle-left" /> Other
            Analyses
          </Link>
        </h4>
      )}
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <AnalysisContext.Provider value={value}>
            <RouteForHash hash="#overview" isDefault>
              <Overview />
            </RouteForHash>
            <RouteForHash hash="#qc">
              <QualityControl />
            </RouteForHash>
            <RouteForHash hash="#contigs-viewer">
              <ContigViewer />
            </RouteForHash>
            <RouteForHash hash="#taxonomic">
              <TaxonomySubpage accession={accession} />
            </RouteForHash>
            <RouteForHash hash="#functional">
              <FunctionalSubpage />
            </RouteForHash>
            <RouteForHash hash="#abundance">
              <Abundance />
            </RouteForHash>
            <RouteForHash hash="#path-systems">
              <PathwaysSubpage />
            </RouteForHash>
            <RouteForHash hash="#download">
              <Downloads endpoint="analyses" accession={accession} />
            </RouteForHash>
          </AnalysisContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default AnalysisPage;
