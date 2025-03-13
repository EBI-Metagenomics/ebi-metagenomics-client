import React, { useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview/v2index';
import QualityControl from 'components/Analysis/QualityControl/v2index';
import ContigViewer from 'components/Analysis/ContigViewer';
import TaxonomySubpage from 'components/Analysis/Taxonomy/v2index';
import FunctionalSubpage from 'components/Analysis/Functional/v2index';
import PathwaysSubpage from 'components/Analysis/Pathways/v2Index';
import RouteForHash from 'components/Nav/RouteForHash';
import Downloads from 'components/Downloads/v2index';
import Abundance from 'components/Analysis/Abundance';
import V2AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail/Index';
import { AnalysisDetail } from 'interfaces';
import Asv from 'components/Asv';
import AssemblyTaxonomy from 'components/Analysis/AssemblyTaxonomy';

// TODO: find v2 counterpart

const isAssembly = (data: AnalysisDetail): boolean =>
  ['ASSEM', 'HYASS'].includes(data.experiment_type as string);

const isAtleastVersion5 = (data: AnalysisDetail): boolean =>
  ['5.0', 'V6'].includes(data.pipeline_version);

const isNotAmplicon = (data: AnalysisDetail): boolean => {
  return data.experiment_type !== 'AMPLI';
};

const isAmplicon = (data: AnalysisDetail): boolean => {
  return data.experiment_type === 'AMPLI';
};

const V2AnalysisPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);
  const value = useMemo(() => ({ overviewData: data }), [data]);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const analysisData = data;
  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Quality control', to: '#qc' },
    { label: 'Taxonomy', to: '#taxonomic' },
    { label: 'Functional analysis', to: '#functional' },
    { label: 'Pathways/Systems', to: '#path-systems' },
    { label: 'Contig Viewer', to: '#contigs-viewer' },
    // isNotAmplicon(analysisData)
    //   ? { label: 'Functional analysis', to: '#functional' }
    //   : null,
    // isAssembly(analysisData) && isAtleastVersion5(analysisData)
    //   ? { label: 'Pathways/Systems', to: '#path-systems' }
    //   : null,
    // isAssembly(analysisData) && isAtleastVersion5(analysisData)
    //   ? { label: 'Contig Viewer', to: '#contigs-viewer' }
    //   : null,
    // TODO: ASV  tab, i think is to be conditionally rendered based on if the analysis is an amplicon analysis
    isAmplicon(analysisData) ? { label: 'ASV', to: '#asv' } : null,
    // { label: 'ASV', to: '#asv' },
  ].filter(Boolean);
  return (
    <section className="vf-content">
      <h2>Analysis {accession}</h2>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <V2AnalysisContext.Provider value={value}>
            <RouteForHash hash="#overview" isDefault>
              <Overview />
            </RouteForHash>
            <RouteForHash hash="#qc">
              <QualityControl />
            </RouteForHash>
            <RouteForHash hash="#asv">
              <Asv />
            </RouteForHash>
            <RouteForHash hash="#contigs-viewer">
              <ContigViewer />
            </RouteForHash>
            <RouteForHash hash="#taxonomic">
              {isAssembly(analysisData) ? (
                <AssemblyTaxonomy />
              ) : (
                <TaxonomySubpage accession={accession} />
              )}
              {/* <TaxonomySubpage accession={accession} /> */}
              {/* <AssemblyTaxonomy /> */}
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
              <Downloads />
            </RouteForHash>
          </V2AnalysisContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default V2AnalysisPage;
