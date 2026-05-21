import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import LegacyFunctionalTable from '../LegacyFunctionalTable';

type PfamProps = {
  isLegacy?: boolean;
  legacyFile?: Download;
};

const PfamTab: React.FC<PfamProps> = ({ isLegacy, legacyFile }) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

  const dataFile: Download | undefined = analysisData?.downloads.find(
    (file) => file.download_group === 'functional_annotation.pfams'
  );

  if (isLegacy) {
    if (!legacyFile) {
      return (
        <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
          <p>No Pfam identifiers file available</p>
        </div>
      );
    }
    return (
      <div className="vf-stack">
        <h5>Pfam domains</h5>
        <DetailedVisualisationCard
          ftpLink={legacyFile.url}
          title={legacyFile.alias}
        >
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Pfam domains are functional regions within proteins that represent
              conserved evolutionary units.
            </p>
          </div>
          <LegacyFunctionalTable
            url={legacyFile.url}
            title={legacyFile.short_description}
            type="pfam"
          />
        </DetailedVisualisationCard>
      </div>
    );
  }

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
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
        <CompressedTSVTable
          download={dataFile}
          barChartSpec={{
            title: 'Pfam domains',
            labelsCol: {
              id: 'pfam_accession',
              Header: 'Description',
              accessor: (d) => `${d[0]}: ${d[1]}`,
            },
            countsCol: {
              id: 'count',
              Header: 'Count',
              accessor: (d) => Number(d[2]),
            },
          }}
        />
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default PfamTab;
