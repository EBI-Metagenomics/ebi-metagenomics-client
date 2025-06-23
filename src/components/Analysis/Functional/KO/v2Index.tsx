import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const KOTab = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // This is used as a placeholder until the actual KO data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">KO Terms</h3>
          <p className="text-sm text-gray-600 mb-4">
            KEGG Orthology (KO) terms represent functional orthologs of genes
            and proteins in metabolic pathways.
          </p>
          <p className="text-sm">
            Download this file to view the complete KO term annotations for this
            analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default KOTab;
