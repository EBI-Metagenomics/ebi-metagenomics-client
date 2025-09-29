import React, { useContext } from 'react';
import AnalysisContext, { AnalysisContextType } from 'pages/Analysis/V2AnalysisContext';
import { Download } from 'interfaces/index';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

const InterPro: React.FC = () => {
  const { overviewData: analysisData } = useContext<AnalysisContextType>(AnalysisContext);

  const dataFile: Download | undefined = analysisData?.downloads.find(
    (file) =>
      file.download_group === 'functional_annotation.interpro_identifiers'
  );

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
        <p>No InterPro identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>InterPro match summary</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
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
        <CompressedTSVTable download={dataFile} />
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default InterPro;
