import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import { sortBy } from 'lodash-es';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

const AntiSmashTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);

  let dataFiles: Download[] | undefined =
    analysisOverviewData?.downloads.filter(
      (file: Download) =>
        file.download_group === 'pathways_and_systems.antismash'
    );

  if (dataFiles) {
    dataFiles = sortBy(dataFiles, (file) => file.index_files?.length).reverse();
  }

  if (!dataFiles) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
        <p>No antiSMASH files available</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        antiSMASH (antibiotics & Secondary Metabolite Analysis Shell) identifies
        biosynthetic gene clusters in bacterial and fungal genomes, providing
        insights into secondary metabolite production.
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
                  title: 'antiSMASH Clusters',
                  labelsCol: {
                    id: 'cluster_type',
                    Header: 'Cluster type',
                    accessor: (d) => d[1],
                  },
                  countsCol: {
                    id: 'count',
                    Header: 'Count',
                    accessor: (d) => Number(d[2]),
                  },
                }}
              />
              <p className="text-sm">
                Download this file to view the complete antiSMASH cluster
                annotations for this analysis.
              </p>
            </>
          )}
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default AntiSmashTab;
