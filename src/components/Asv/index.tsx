import React, { useEffect, useState } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import ChimericProportions from 'components/Asv/ChimericProportions';
import AsvDistribution from 'components/Asv/AsvDistribution';
import PrimerIdentification from 'components/PrimerIdentification';
import { fetchText } from 'utils/fetch';

const BASE_TABS = [
  { id: 'qc-statistics', label: 'Quality Control Statistics' },
  { id: 'asv-distribution', label: 'ASV Distribution' },
] as const;

const PRIMER_IDENTIFICATION_TAB = {
  id: 'primer-identification',
  label: 'Primer Identification',
} as const;

const Asv: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const { hash } = window.location;
    const tabId = hash.replace('#', '');
    return (
      [...BASE_TABS, PRIMER_IDENTIFICATION_TAB].find((t) => t.id === tabId)
        ?.id || BASE_TABS[0].id
    );
  });
  const [primerIdentificationTabStatus, setPrimerIdentificationTabStatus] =
    useState<'checking' | 'available' | 'unavailable'>('checking');
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);
  const dada2StatsFile = data?.downloads.find(
    (file) => file.download_group === 'asv.stats' && file.file_type === 'tsv'
  );
  const asvDistributionFile = data?.downloads.find(
    (file) =>
      file.download_group === 'asv.distribution' && file.file_type === 'tsv'
  );
  const primerIdentificationFile = data?.downloads.find(
    (file) =>
      file.download_group === 'primer_identification' &&
      file.file_type === 'tsv'
  );
  const shouldShowPrimerTab =
    primerIdentificationTabStatus === 'available' ||
    (primerIdentificationTabStatus === 'checking' &&
      activeTab === PRIMER_IDENTIFICATION_TAB.id &&
      Boolean(primerIdentificationFile?.url));
  const tabs = shouldShowPrimerTab
    ? [...BASE_TABS, PRIMER_IDENTIFICATION_TAB]
    : [...BASE_TABS];
  const activeTabIsAvailable = tabs.some((tab) => tab.id === activeTab);

  useEffect(() => {
    let isCancelled = false;

    if (!primerIdentificationFile?.url) {
      setPrimerIdentificationTabStatus('unavailable');
      return () => {
        isCancelled = true;
      };
    }

    setPrimerIdentificationTabStatus('checking');

    fetchText(
      primerIdentificationFile.url,
      {},
      'The primer data file is empty or missing.'
    )
      .then((tsvText) => {
        const lines = tsvText.trim().split('\n');
        const hasPrimerRows = lines.length >= 2;

        if (!isCancelled) {
          setPrimerIdentificationTabStatus(
            hasPrimerRows ? 'available' : 'unavailable'
          );
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setPrimerIdentificationTabStatus('unavailable');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [primerIdentificationFile]);

  useEffect(() => {
    if (!activeTabIsAvailable) {
      const fallbackTab = BASE_TABS[0].id;
      setActiveTab(fallbackTab);
      const { pathname, search } = window.location;
      const cleanPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
      window.history.replaceState(
        null,
        '',
        `${cleanPathname}${search}#${fallbackTab}`
      );
    }
  }, [activeTab, activeTabIsAvailable]);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
    const { pathname, search } = window.location;
    const cleanPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
    window.history.pushState(null, '', `${cleanPathname}${search}#${tabId}`);
  };

  const getSpecificDownloadsFile = (group: string, type: string) => {
    return data?.downloads.find(
      (file) => file.download_group === group && file.file_type === type
    );
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
          {dada2StatsFile ? (
            <DetailedVisualisationCard ftpLink={dada2StatsFile?.url}>
              <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">
                  Amplicon Sequencing Results{' '}
                </h3>
                {/* <p className="vf-card__subheading">With sub–heading</p> */}
                <p className="vf-card__text">
                  {/* <ChimericProportions fileUrl="http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/amplicon/asv/SRR1111111_dada2_stats.tsv" /> */}
                  <ChimericProportions fileUrl={dada2StatsFile?.url} />
                </p>
              </div>
            </DetailedVisualisationCard>
          ) : (
            <div className="empty-message">No DADA2 statistics available.</div>
          )}
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
          {asvDistributionFile ? (
            <DetailedVisualisationCard ftpLink={asvDistributionFile.url}>
              <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">ASV Distribution </h3>
                <p className="vf-card__text">
                  <AsvDistribution fileUrl={asvDistributionFile.url} />
                </p>
              </div>
            </DetailedVisualisationCard>
          ) : (
            <div className="empty-message">No ASV distribution available.</div>
          )}
        </section>

        {primerIdentificationTabStatus === 'available' && (
          <section
            className="vf-tabs__section"
            id="primer-identification"
            role="tabpanel"
            aria-labelledby="primer-identification"
            style={{
              display: activeTab === 'primer-identification' ? 'block' : 'none',
            }}
          >
            <PrimerIdentification
              infoText="Primers are short sequences of nucleic acid that provide a starting point for DNA synthesis.
            In 16S rRNA analysis, they target specific variable regions of the gene."
              downloadableFile={getSpecificDownloadsFile(
                'primer_identification',
                'tsv'
              )}
            />
          </section>
        )}
      </div>
    </section>
  );
};

export default Asv;
