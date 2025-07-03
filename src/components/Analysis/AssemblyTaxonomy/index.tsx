import React, { useContext } from 'react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import 'src/components/Analysis/Taxonomy/style.css';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from 'interfaces';

const AssemblyTaxonomy: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const kronaFile = analysisData.downloads.find(
    (file: Download) =>
      file.download_type === 'Taxonomic analysis' && file.file_type === 'html'
  );

  return (
    <div className="vf-stack vf-stack--400">
      <h1 className="vf-text vf-text--heading-l">Assembly Taxonomy</h1>

      <details className="vf-details" open>
        <summary className="vf-details--summary">
          Taxonomic Analysis Visualization
        </summary>

        <DetailedVisualisationCard ftpLink={kronaFile.url}>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">Krona Taxonomy Visualization</h3>
            <p className="vf-card__subheading">
              Interactive taxonomic hierarchy
            </p>
            <p className="vf-card__text">
              <iframe
                className="krona-iframe"
                src={kronaFile.url}
                style={{ width: '100%', height: '700px', border: 'none' }}
                title="Krona Taxonomy Visualization"
              />
            </p>
          </div>
        </DetailedVisualisationCard>
      </details>

      <div className="taxonomy-info">
        <h3>About This Visualization</h3>
        <p>
          This interactive Krona chart displays the taxonomic composition of the
          metagenomic assembly. The visualization allows you to explore the
          hierarchical structure of the taxonomic classifications, from domain
          down to species level.
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

export default AssemblyTaxonomy;
