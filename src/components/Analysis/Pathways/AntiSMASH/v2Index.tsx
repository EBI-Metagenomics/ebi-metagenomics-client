import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const AntiSmashTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // This is used as a placeholder until the actual antiSMASH data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">antiSMASH Clusters</h3>
          <p className="text-sm text-gray-600 mb-4">
            antiSMASH (antibiotics & Secondary Metabolite Analysis Shell) identifies 
            biosynthetic gene clusters in bacterial and fungal genomes, providing insights 
            into secondary metabolite production.
          </p>
          <p className="text-sm">
            Download this file to view the complete antiSMASH cluster annotations for this
            analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default AntiSmashTab;
