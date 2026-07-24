import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import { sortBy } from 'lodash-es';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import LegacyFunctionalTable from 'components/Analysis/Functional/LegacyFunctionalTable';

type KeggModuleProps = {
  isLegacy?: boolean;
  legacyFile?: Download;
  dataFiles?: Download[];
  barChartColumnIndexes?: {
    label: number;
    count: number;
  };
};

const KeggModuleTab: React.FC<KeggModuleProps> = ({
  isLegacy,
  legacyFile,
  dataFiles: providedDataFiles,
  barChartColumnIndexes = { label: 1, count: 2 },
}) => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  let dataFiles: Download[] | undefined =
    providedDataFiles ??
    analysisOverviewData?.downloads.filter(
      (file: Download) =>
        file.download_group === 'pathways_and_systems.kegg_modules' &&
        file.alias.includes('_summary')
    );

  if (dataFiles) {
    dataFiles = sortBy(dataFiles, (file) => file.index_files?.length).reverse();
  }

  if (isLegacy) {
    if (!legacyFile) {
      return (
        <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
          <p>No KEGG modules available</p>
        </div>
      );
    }
    return (
      <div className="vf-stack">
        <p className="text-sm text-gray-600 mb-4">
          KEGG Modules represent functional units in metabolic and signaling
          pathways, providing insights into the completeness of biological
          processes.
        </p>
        <DetailedVisualisationCard
          ftpLink={legacyFile.url}
          title={legacyFile.alias}
        >
          <div className="p-4">
            <h5>{legacyFile.short_description}</h5>
            <p className="vf-text text-body--1">
              {legacyFile.long_description}
            </p>
          </div>
          <LegacyFunctionalTable
            url={legacyFile.url}
            title={legacyFile.short_description}
            type="ko" // Use "ko" type as it's similar (Accession, Description, Count/Completeness)
            maxLabels={0}
          />
        </DetailedVisualisationCard>
      </div>
    );
  }

  if (!dataFiles?.length) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
        <p>No KEGG modules available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <p className="text-sm text-gray-600 mb-4">
        KEGG Modules represent functional units in metabolic and signaling
        pathways, providing insights into the completeness of biological
        processes.
      </p>
      {dataFiles.map((dataFile) => (
        <DetailedVisualisationCard
          ftpLink={dataFile.url}
          title={dataFile.alias}
          key={dataFile.alias}
        >
          <div className="p-4">
            <h5>{dataFile.short_description}</h5>
            <p className="vf-text text-body--1">{dataFile.long_description}</p>
          </div>
          <div className="p-4">
            <CompressedTSVTable
              download={dataFile}
              barChartSpec={{
                title: 'KEGG Modules',
                labelsCol: {
                  id: 'module_accession',
                  Header: 'Module identifier',
                  accessor: (d) => d[barChartColumnIndexes.label],
                },
                countsCol: {
                  id: 'completeness',
                  Header: 'Completeness',
                  accessor: (d) => Number(d[barChartColumnIndexes.count]),
                },
              }}
            />
            <p className="text-sm mt-4">
              Download this file to view the complete KEGG modules for this
              analysis.
            </p>
          </div>
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default KeggModuleTab;
