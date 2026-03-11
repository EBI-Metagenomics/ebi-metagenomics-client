import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
<<<<<<< Feature/Pathway-Visualisations
import { sortBy } from 'lodash-es';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
=======
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import { first, last, sortBy } from 'lodash-es';
>>>>>>> v6-early-access

const AntiSmashTab: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

<<<<<<< Feature/Pathway-Visualisations
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
=======
  let dataFiles: Download[] | undefined = analysisData?.downloads.filter(
    (file) => file.download_group === 'pathways_and_systems.antismash'
  );
  if (dataFiles) {
    dataFiles = sortBy(dataFiles, (file) => file.index_files?.length).reverse();
  }

  if (!dataFiles?.length) {
    return (
      <div className="vf-stack vf-stack--200">
        <p>No antiSMASH file available</p>
>>>>>>> v6-early-access
      </div>
    );
  }

  return (
<<<<<<< Feature/Pathway-Visualisations
    <div>
=======
    <div className="vf-stack">
>>>>>>> v6-early-access
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
<<<<<<< Feature/Pathway-Visualisations
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
=======
            <CompressedTSVTable
              download={dataFile}
              barChartSpec={{
                title: 'antismash',
                labelsCol: {
                  id: 'cluster_type',
                  Header: 'Cluster type',
                  accessor: first,
                },
                countsCol: {
                  id: 'count',
                  Header: 'Count',
                  accessor: (d) => Number(last(d)),
                },
              }}
            />
>>>>>>> v6-early-access
          )}
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default AntiSmashTab;
