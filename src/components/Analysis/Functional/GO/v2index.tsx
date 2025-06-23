import React, { useContext } from 'react';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const GO: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  // Find the GO data file
  // const dataFile = analysisOverviewData.downloads.find(
  //   (file) => file.alias.includes === 'go' && file.file_type === 'tsv.gz'
  // );

  // This is used as a placholder until the actual Assembly data is available on the API
  const dataFile = analysisOverviewData.downloads[0];

  return (
    <div>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">GO Terms</h3>
          <p className="text-sm text-gray-600 mb-4">
            Gene Ontology (GO) terms describe gene product functions and
            relationships in any organism.
          </p>
          <p className="text-sm">
            Download this file to view the complete GO term annotations for this
            analysis.
          </p>
        </div>
      </SlimVisualisationCard>
    </div>
  );
};

export default GO;
