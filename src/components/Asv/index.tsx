import React, { useContext, useMemo, useState } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview/v2index';
import QualityControl from 'components/Analysis/QualityControl/v2index';
import ContigViewer from 'components/Analysis/ContigViewer';
import TaxonomySubpage from 'components/Analysis/Taxonomy/v2index';
import FunctionalSubpage from 'components/Analysis/Functional/v2index';
import PathwaysSubpage from 'components/Analysis/Pathways';
import RouteForHash from 'components/Nav/RouteForHash';
import Downloads from 'components/Downloads/v2index';
import Abundance from 'components/Analysis/Abundance';
import V2AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail/Index';
import { AnalysisDetail } from 'interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import ChimericProportions from 'components/Asv/ChimericProportions';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const isAssembly = (data: AnalysisDetail): boolean =>
  ['ASSEM', 'HYASS'].includes(data.experiment_type as string);

const isAtleastVersion5 = (data: AnalysisDetail): boolean =>
  ['5.0', 'V6'].includes(data.pipeline_version);

const isNotAmplicon = (data: AnalysisDetail): boolean => {
  return data.experiment_type !== 'AMPLI';
};

const Asv: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  console.log('analysisData ', analysisData);
  const [activeTab, setActiveTab] = useState(() => {
    const { hash } = window.location;
    return hash === '#asv-distribution' ? 'asv-distribution' : 'qc-statistics';
  });
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);
  const value = useMemo(() => ({ overviewData: data }), [data]);
  const dada2StatsFile = data?.downloads.find(
    (file) => file.download_group === 'asv.stats' && file.file_type === 'tsv'
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const tabs = [
    { id: 'qc-statistics', label: 'Quality Control Statistics' },
    { id: 'asv-distribution', label: 'ASV Distribution' },
    { id: 'primer-identification', label: 'Primer Identification' },
  ];

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
    window.history.pushState(null, '', `#${tabId}`);
  };

  return (
    <section className="vf-content">
      <div id="asv-tabs" className="vf-tabs">
        <ul className="vf-tabs__list" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="vf-tabs__item" role="presentation">
              <a
                className={`vf-tabs__link ${
                  activeTab === tab.id ? 'is-active' : ''
                }`}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tab.id}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="vf-tabs-content">
        <section
          className="vf-tabs__section"
          id="qc-statistics"
          role="tabpanel"
          aria-labelledby="qc-statistics"
          style={{
            display: activeTab === 'qc-statistics' ? 'block' : 'none',
          }}
        >
          <DetailedVisualisationCard ftpLink={dada2StatsFile.url}>
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">Amplicon Sequencing Results </h3>
              {/* <p className="vf-card__subheading">With sub–heading</p> */}
              <p className="vf-card__text">
                {/* <ChimericProportions fileUrl="http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/amplicon/asv/SRR1111111_dada2_stats.tsv" /> */}
                <ChimericProportions fileUrl={dada2StatsFile.url} />
              </p>
            </div>
          </DetailedVisualisationCard>
        </section>
        <section
          className="vf-tabs__section"
          id="asv-distribution"
          role="tabpanel"
          aria-labelledby="asv-distribution"
          style={{
            display: activeTab === 'asv-distribution' ? 'block' : 'none',
          }}
        >
          <a
            href="https://www.ebi.ac.uk/training/services/mgnify/live-events"
            className="vf-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View ASV Distribution{' '}
            <i className="icon icon-common icon-external-link-alt" />
          </a>
        </section>

        <section
          className="vf-tabs__section"
          id="primer-identification"
          role="tabpanel"
          aria-labelledby="primer-identification"
          style={{
            display: activeTab === 'primer-identification' ? 'block' : 'none',
          }}
        >
          <a
            href="https://www.ebi.ac.uk/training/services/mgnify/live-events"
            className="vf-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Primer Identification{' '}
            <i className="icon icon-common icon-external-link-alt" />
          </a>
        </section>
      </div>
    </section>
  );
};

export default Asv;
