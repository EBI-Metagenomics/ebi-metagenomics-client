import React, { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useLegacyAnalysisKnownFiles from 'hooks/data/useLegacyAnalysisKnownFiles';
import Loading from 'components/UI/Loading';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import LegacyTaxonomyTable from './LegacyTaxonomyTable';
import Tabs from 'components/UI/Tabs';

const LegacyTaxonomy: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const { isSupportedVersion, resultsDir, taxonomyPaths } =
    useLegacyAnalysisKnownFiles();
  const { hash } = useLocation();

  const availableMarkers = useMemo(() => {
    if (!taxonomyPaths) return [];
    return Object.keys(taxonomyPaths).filter(
      (m) =>
        taxonomyPaths[m].krona || taxonomyPaths[m].tsv || taxonomyPaths[m].txt
    );
  }, [taxonomyPaths]);

  const activeMarker = useMemo(() => {
    const hashMarker = hash.replace('#', '');
    if (availableMarkers.includes(hashMarker)) {
      return hashMarker;
    }
    return availableMarkers[0] || '';
  }, [availableMarkers, hash]);

  if (!analysisData) return <Loading />;

  if (!isSupportedVersion || availableMarkers.length === 0) {
    return (
      <div className="vf-stack vf-stack--200">
        <p>
          Taxonomy files can be found from the{' '}
          <a href={resultsDir} target="_blank" rel="noopener noreferrer">
            results directory
          </a>
        </p>
      </div>
    );
  }

  const tabs = availableMarkers.map((marker) => ({
    label: marker.toUpperCase(),
    to: `#${marker}`,
  }));

  return (
    <div className="vf-stack vf-stack--400">
      <Tabs tabs={tabs} />
      <div className="vf-tabs-content">
        {availableMarkers.map((marker) => (
          <div
            key={marker}
            style={{ display: marker === activeMarker ? 'block' : 'none' }}
          >
            <div className="vf-stack vf-stack--400">
              {taxonomyPaths?.[marker].krona && (
                <DetailedVisualisationCard
                  title={`${marker.toUpperCase()} KRONA Plot`}
                  ftpLink={taxonomyPaths?.[marker].krona}
                >
                  <iframe
                    title={`${marker} Krona Plot`}
                    src={taxonomyPaths?.[marker].krona}
                    width="100%"
                    height="600px"
                    style={{ border: 'none' }}
                  />
                </DetailedVisualisationCard>
              )}
              {(taxonomyPaths?.[marker].tsv || taxonomyPaths?.[marker].txt) && (
                <DetailedVisualisationCard
                  title={`${marker.toUpperCase()} Taxonomy Data`}
                  ftpLink={
                    taxonomyPaths?.[marker].tsv || taxonomyPaths?.[marker].txt
                  }
                >
                  <LegacyTaxonomyTable
                    key={`${marker}-table`}
                    url={taxonomyPaths?.[marker].tsv}
                    fallbackUrl={taxonomyPaths?.[marker].txt}
                    title=""
                  />
                </DetailedVisualisationCard>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegacyTaxonomy;
