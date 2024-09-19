import React, { useMemo } from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyV2ResponseObj } from 'hooks/data/useData/v2Index';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview/v2index';
import QualityControl from 'components/Analysis/QualityControl';
import ContigViewer from 'components/Analysis/ContigViewer';
import TaxonomySubpage from 'components/Analysis/Taxonomy';
import FunctionalSubpage from 'components/Analysis/Functional';
import PathwaysSubpage from 'components/Analysis/Pathways';
import RouteForHash from 'components/Nav/RouteForHash';
import { Link } from 'react-router-dom';
import Downloads from 'components/Downloads';
import Abundance from 'components/Analysis/Abundance';
import useMGnifyV2Data from 'hooks/data/useMGnifyV2Data';
import AnalysisContext from './AnalysisContext';
import V2AnalysisContext from 'pages/Analysis/V2AnalysisContext';

// const hasAbundance = (
//   includes: { attributes?: { 'group-type'?: string } }[]
// ): boolean => {
//   return includes.some(
//     (included) => included?.attributes?.['group-type'] === 'Statistics'
//   );
// };

// TODO: find v2 counterpart

const isAssembly = (data: MGnifyDatum): boolean =>
  ['assembly', 'hybrid_assembly'].includes(
    // data.attributes['experiment-type'] as string
    data.experiment_type as string
  );
// TODO: find v2 counterpart
// const isAtleastVersion5 = (data: MGnifyDatum): boolean =>
//   Number(data.attributes['pipeline-version']) >= 5;

// TODO: find v2 counterpart
// const isNotAmplicon = (data: MGnifyDatum): boolean =>
//   data.attributes['experiment-type'] !== 'amplicon';

const V2AnalysisPage: React.FC = () => {
  const accession = useURLAccession();
  // const { data, loading, error } = useMGnifyV2Data(`analyses/MGYA00779423`, {
  //   //   const { data, loading, error } = useMGnifyData(`analyses/${accession}`, {
  //   include: 'downloads',
  // });

  const loading = false;
  const error = null;

  const data = useMGnifyV2Data(`analyses/MGYA00779423`, {
    include: 'downloads',
  });
  console.log('V2 INDEX data ', data);
  const value = useMemo(
    // () => ({ overviewData: data, included: data?.included }),
    () => ({ overviewData: data }),
    [data]
  );
  console.log('this is value', value);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  // const { data: analysisData, included } = data as MGnifyV2ResponseObj;
  // const { data: analysisData } = data as MGnifyV2ResponseObj;
  const analysisData = data;

  // console.log('DATA', data);

  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Quality control', to: '#qc' },
    { label: 'Taxonomic analysis', to: '#taxonomic' },
    // TODO: find v2 counterpart
    // isNotAmplicon(analysisData)
    //   ? { label: 'Functional analysis', to: '#functional' }
    //   : null,

    // TODO: find v2 counterpart
    // included && hasAbundance(included)
    //   ? { label: 'Abundance and comparison', to: '#abundance' }
    //   : null,
    // TODO: find v2 counterpart
    // isAssembly(analysisData) && isAtleastVersion5(analysisData)
    //   ? { label: 'Pathways/Systems', to: '#path-systems' }
    //   : null,
    // TODO: find v2 counterpart
    // isAssembly(analysisData) && isAtleastVersion5(analysisData)
    //   ? { label: 'Contig Viewer', to: '#contigs-viewer' }
    //   : null,
    { label: 'Download', to: '#download' }
  ].filter(Boolean);
  // TODO: find v2 counterpart
  // const linkToOtherAnalyses = isAssembly(analysisData)
  //   ? `/assemblies/${analysisData?.relationships?.assembly?.data?.id}`
  //   : `/runs/${analysisData?.relationships?.run?.data?.id}`;
  return (
    <section className="vf-content">
      <h2>Analysis {accession}</h2>
      {/*TODO: find v2 counterpart*/}
      {/*{linkToOtherAnalyses && (*/}
      {/*  <h4>*/}
      {/*    <Link to={linkToOtherAnalyses}>*/}
      {/*      <i className="icon icon-common icon-arrow-circle-left" /> Other*/}
      {/*      Analyses*/}
      {/*    </Link>*/}
      {/*  </h4>*/}
      {/*)}*/}
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
          </V2AnalysisContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default V2AnalysisPage;
