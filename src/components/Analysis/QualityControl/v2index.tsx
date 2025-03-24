import React, { useContext } from 'react';

import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import QualityControlChart from './V2QCChart';

import './style.css';

const QualityControl: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const summaryData = analysisData.quality_control_summary;

  const isAssembly = analysisData?.experiment_type === 'ASSEM';
  const units = isAssembly ? 'contigs' : 'reads';

  return (
    <div className="vf-stack vf-stack--200" data-cy="run-qc-chart">
      <p>
        The chart below shows the number of {units} which pass the quality
        control steps in the pipeline. Paired-end sequences may have been
        merged, in which case the initial number of {units} may differ from the
        number given by ENA.
      </p>
      <QualityControlChart summaryData={summaryData} />
    </div>
  );
};

export default QualityControl;
