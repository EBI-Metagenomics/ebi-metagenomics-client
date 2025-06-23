import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const KeggModuleTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // This is used as a placeholder until the actual KEGG Module data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">KEGG Modules</h3>
          <p className="text-sm text-gray-600 mb-4">
            KEGG Modules represent functional units in metabolic and signaling pathways, 
            providing insights into the completeness of biological processes.
          </p>
          <p className="text-sm">
            Download this file to view the complete KEGG Module annotations for this
            analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default KeggModuleTab;
