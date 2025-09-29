import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from 'interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

const PfamTab: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

  const dataFile: Download = analysisData.downloads.find(
    (file) => file.download_group === 'functional_annotation.pfams'
  );

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
        <p>No Pfam identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>Pfam domains</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Pfam domains are functional regions within proteins that represent
            conserved evolutionary units.
          </p>
          <p className="text-sm">
            Download this file to view the complete Pfam domain annotations for
            this analysis.
          </p>
        </div>
        <CompressedTSVTable download={dataFile} />
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default PfamTab;
