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
      {/* <VisualisationCards ftpLink="https://ftp.ebi.ac.uk/pub/databases/metagenomics/amplicon-pipeline-v6-results/test-example-2025/ERR4334351/qc/ERR4334351_multiqc_report.html"> */}
      <DetailedVisualisationCard ftpLink={qcFile.url}>
        <div className="vf-card__content | vf-stack vf-stack--400">
          <h3 className="vf-card__heading">Multi QC Report </h3>
          <p className="vf-card__subheading">With sub–heading</p>
          <p className="vf-card__text">
            <iframe
              className="multiqc-iframe"
              // src="https://ftp.ebi.ac.uk/pub/databases/metagenomics/amplicon-pipeline-v6-results/test-example-2025/ERR4334351/qc/ERR4334351_multiqc_report.html"
              src={qcFile.url}
            />
          </p>
        </div>
      </DetailedVisualisationCard>
    </div>
  );
};

export default QualityControl;
