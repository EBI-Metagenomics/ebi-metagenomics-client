import React, { useContext } from 'react';

import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import QualityControlChart from './V2QCChart';

import './style.css';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

const QualityControl: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const qcFile = analysisData.downloads.filter(
    (file) =>
      file.download_group === 'quality_control' && file.file_type === 'html'
  )[0];
  const summaryData = analysisData.quality_control_summary;

  const isAssembly = analysisData?.experiment_type === 'ASSEM';
  const units = isAssembly ? 'contigs' : 'reads';

  return (
    <div className="vf-stack vf-stack--200" data-cy="run-qc-chart">
      <DetailedVisualisationCard ftpLink={qcFile.url}>
        <iframe className="multiqc-iframe" src={qcFile.url} />
      </DetailedVisualisationCard>
    </div>
  );
};

export default QualityControl;
