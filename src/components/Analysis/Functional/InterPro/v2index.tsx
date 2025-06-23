import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';

const InterPro: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  // const dataFile = analysisData.downloads.find(
  //   (file) =>
  //     file.alias.includes('interpro') && file.file_type === 'tsv.gz'
  // );

  const dataFile = analysisData.downloads[0]; // Placeholder until actual data is available

  return (
    <div className="vf-stack">
      <h5>InterPro match summary</h5>
      <SlimVisualisationCard fileData={dataFile}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            InterPro is a database of protein families, domains, and functional
            sites. It provides functional analysis of proteins by classifying
            them into families and predicting the presence of domains and sites.
          </p>
          <p className="text-sm">
            Download this file to view the complete InterPro annotations for
            this analysis.
          </p>
        </div>
      </SlimVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default InterPro;
