import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import { first, last, sortBy } from 'lodash-es';

const AntiSmashTab: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);

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
      </div>
    );
  }

  return (
    <div className="vf-stack">
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
          )}
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default AntiSmashTab;
