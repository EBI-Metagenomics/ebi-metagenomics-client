import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import GenomePropertiesVisualiser from './GenomePropertiesVisualiser';

type GenomePropertiesProps = {
  isLegacy?: boolean;
  legacyFile?: Download;
};

const GenomePropertiesTab: React.FC<GenomePropertiesProps> = ({
  isLegacy,
  legacyFile,
}) => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  let dataFiles: Download[] | undefined =
    analysisOverviewData?.downloads.filter(
      (file: Download) =>
        file.download_group === 'pathways_and_systems.genome_properties' &&
        (file.alias.includes('tsv') || file.alias.includes('json'))
    );

  if (dataFiles) {
    const jsonFiles = dataFiles.filter((f) => f.alias.includes('json'));
    if (jsonFiles.length) dataFiles = jsonFiles;
  }

  if (isLegacy) {
    if (!legacyFile) {
      return (
        <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
          <p>No Genome properties files available</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Genome Properties is a system for describing prokaryotic biochemical
          pathways, genome architecture, and biological systems, providing
          insights into the functional capabilities of organisms.
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
          <div className="p-4">
            <GenomePropertiesVisualiser download={legacyFile} />
          </div>
        </DetailedVisualisationCard>
      </div>
    );
  }

  if (!dataFiles?.length) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
        <p>No Genome properties files available</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Genome Properties is a system for describing prokaryotic biochemical
        pathways, genome architecture, and biological systems, providing
        insights into the functional capabilities of organisms.
      </p>

      {dataFiles.map((dataFile, index) => {
        const viewModeKey = dataFile.alias || `genome-properties-${index}`;
        return (
          <DetailedVisualisationCard
            ftpLink={dataFile.url}
            title={dataFile.alias}
            key={viewModeKey}
          >
            <div className="p-4">
              <h5>{dataFile.short_description}</h5>
              <p className="vf-text text-body--1">
                {dataFile.long_description}
              </p>
            </div>

            <div className="p-4">
              {dataFile.alias.includes('json.gz') ? (
                <GenomePropertiesVisualiser download={dataFile} />
              ) : (
                <CompressedTSVTable
                  download={dataFile}
                  barChartSpec={{
                    title: 'Genome Properties',
                    labelsCol: {
                      id: 'property_name',
                      Header: 'Property name',
                      accessor: (d) => d[1],
                    },
                    countsCol: {
                      id: 'result',
                      Header: 'Result',
                      accessor: (d) => d[2],
                    },
                  }}
                />
              )}

              <p className="text-sm mt-4">
                Download this file to view the complete Genome Properties
                annotations for this analysis.
              </p>
            </div>
          </DetailedVisualisationCard>
        );
      })}
    </div>
  );
};

export default GenomePropertiesTab;
