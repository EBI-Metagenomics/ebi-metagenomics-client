import React, { useContext, useMemo, useState } from 'react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import 'components/Analysis/AmpliconTaxonomy/style.css';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import InfoBanner from 'components/UI/InfoBanner';
import KronaIframe from 'components/UI/KronaIframe';

const WGSTaxonomy: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const kronaFiles = useMemo(
    () =>
      analysisData?.downloads.filter(
        (file: Download) =>
          file.download_type === 'Taxonomic analysis' &&
          file.file_type === 'html'
      ) ?? [],
    [analysisData?.downloads]
  );
  const [selectedKronaUrl, setSelectedKronaUrl] = useState<string>();
  const selectedKronaFile =
    kronaFiles.find((file) => file.url === selectedKronaUrl) ?? kronaFiles[0];

  if (!selectedKronaFile)
    return <InfoBanner title="No taxonomy data available" type="warning" />;

  return (
    <div className="vf-stack vf-stack--400">
      <details className="vf-details" open>
        <summary className="vf-details--summary">
          Taxonomic Analysis Visualization
        </summary>

        <div className="vf-stack vf-stack--400">
          {kronaFiles.length > 1 && (
            <div className="vf-tabs mg-search-tabs">
              <ul className="vf-tabs__list" role="tablist">
                {kronaFiles.map((file) => {
                  const isActive = file.url === selectedKronaFile.url;
                  return (
                    <li className="vf-tabs__item" key={file.url}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`vf-tabs__link mg-button-as-tab ${
                          isActive ? 'is-active' : ''
                        }`}
                        onClick={() => setSelectedKronaUrl(file.url)}
                      >
                        {file.short_description}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <DetailedVisualisationCard ftpLink={selectedKronaFile.url}>
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">Krona Taxonomy Visualization</h3>
              <p className="vf-card__subheading">
                {selectedKronaFile.long_description}
              </p>
              <div className="vf-card__text">
                <KronaIframe
                  key={selectedKronaFile.url}
                  className="krona-iframe"
                  url={selectedKronaFile.url}
                  height="700px"
                  title={selectedKronaFile.short_description}
                />
              </div>
            </div>
          </DetailedVisualisationCard>
        </div>
      </details>

      <div className="taxonomy-info">
        <h3>About This Visualization</h3>
        <p>
          This interactive Krona chart displays the taxonomic composition of the
          metagenome. The visualization allows you to explore the hierarchical
          structure of the taxonomic classifications, from domain down to
          species level.
        </p>
        <p>
          <strong>How to use:</strong> Click on any segment to zoom in on that
          taxonomic group. Use the center of the chart to navigate back up the
          hierarchy.
        </p>
      </div>
    </div>
  );
};

export default WGSTaxonomy;
