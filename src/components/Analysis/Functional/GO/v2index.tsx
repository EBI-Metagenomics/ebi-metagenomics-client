import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from 'interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

const GO: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

  const dataFile: Download = analysisData.downloads.find(
    (file) => file.download_group === 'functional_annotation.go_terms'
  );

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
        <p>No GO identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>Gene Ontology terms</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Gene Ontology (GO) terms describe gene product functions and
            relationships in any organism.
          </p>
          <p className="text-sm">
            Download this file to view the complete GO term annotations for this
            analysis.
          </p>
        </div>
        <CompressedTSVTable download={dataFile} />
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default GO;
