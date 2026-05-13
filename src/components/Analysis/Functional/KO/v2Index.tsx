import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import LegacyFunctionalTable from '../LegacyFunctionalTable';

type KOProps = {
  isLegacy?: boolean;
  legacyFile?: Download;
};

const KOTab: React.FC<KOProps> = ({ isLegacy, legacyFile }) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

  const dataFile: Download | undefined = analysisData?.downloads.find(
    (file) => file.download_group === 'functional_annotation.kegg'
  );

  if (isLegacy) {
    if (!legacyFile) {
      return (
        <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
          <p>No KO identifiers file available</p>
        </div>
      );
    }
    return (
      <div className="vf-stack">
        <h5>KEGG Orthologs</h5>
        <DetailedVisualisationCard
          ftpLink={legacyFile.url}
          title={legacyFile.alias}
        >
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              KEGG Orthology (KO) terms represent functional orthologs of genes
              and proteins in metabolic pathways.
            </p>
          </div>
          <LegacyFunctionalTable
            url={legacyFile.url}
            title={legacyFile.short_description}
            type="ko"
          />
        </DetailedVisualisationCard>
      </div>
    );
  }

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
        <p>No KO identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>KEGG Orthologs</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            KEGG Orthology (KO) terms represent functional orthologs of genes
            and proteins in metabolic pathways.
          </p>
          <p className="text-sm">
            Download this file to view the complete KO term annotations for this
            analysis.
          </p>
        </div>
        <CompressedTSVTable
          download={dataFile}
          columnHeaders={['KO', 'Description']}
          barChartSpec={{
            title: 'KEGG Orthologs',
            labelsCol: {
              id: 'ko_term',
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

export default KOTab;
