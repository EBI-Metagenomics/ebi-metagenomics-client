import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import { sortBy } from 'lodash-es';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

const GenomePropertiesTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  let dataFiles: Download[] | undefined =
    analysisOverviewData?.downloads.filter(
      (file: Download) =>
        file.download_group === 'pathways_and_systems.genome_properties'
    );

  if (dataFiles) {
    dataFiles = sortBy(dataFiles, (file) => file.index_files?.length).reverse();
  }

  if (!dataFiles) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
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
          {!!dataFile.index_files?.length && (
            <>
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
              <p className="text-sm">
                Download this file to view the complete Genome Properties
                annotations for this analysis.
              </p>
            </>
          )}
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default GenomePropertiesTab;
