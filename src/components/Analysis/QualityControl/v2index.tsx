import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import './style.css';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import { Download } from '@/interfaces';

const QualityControl: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

  const qcFile = analysisData?.downloads.find(
    (file: Download) =>
      file.download_group === 'quality_control' && file.file_type === 'html'
  );

  if (!qcFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="run-qc-chart">
        <p>No quality control file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack vf-stack--200" data-cy="run-qc-chart">
      <DetailedVisualisationCard ftpLink={qcFile.url}>
        <iframe
          title="MultiQC iframe"
          className="multiqc-iframe"
          src={qcFile.url}
        />
      </DetailedVisualisationCard>
    </div>
  );
};

export default QualityControl;
