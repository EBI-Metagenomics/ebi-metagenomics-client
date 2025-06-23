import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const PfamTab = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // This is used as a placeholder until the actual Pfam data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">PFAM Domains</h3>
          <p className="text-sm text-gray-600 mb-4">
            PFAM domains are functional regions within proteins that represent
            conserved evolutionary units.
          </p>
          <p className="text-sm">
            Download this file to view the complete PFAM domain annotations for
            this analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default PfamTab;
