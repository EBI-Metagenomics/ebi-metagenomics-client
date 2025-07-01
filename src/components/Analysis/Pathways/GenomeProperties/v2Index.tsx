import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const GenomePropertiesTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // This is used as a placeholder until the actual Genome Properties data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Genome Properties</h3>
          <p className="text-sm text-gray-600 mb-4">
            Genome Properties is a system for describing prokaryotic biochemical
            pathways, genome architecture, and biological systems, providing
            insights into the functional capabilities of organisms.
          </p>
          <p className="text-sm">
            Download this file to view the complete Genome Properties
            annotations for this analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default GenomePropertiesTab;
