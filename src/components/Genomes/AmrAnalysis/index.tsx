import React from 'react';
import type { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

type GenomeAmrAnalysisProps = {
  download: Download;
};

const GenomeAmrAnalysis: React.FC<GenomeAmrAnalysisProps> = ({ download }) => (
  <div className="vf-stack" data-cy="genome-amr">
    <DetailedVisualisationCard ftpLink={download.url} title={download.alias}>
      <div className="p-4">
        <h5>{download.short_description}</h5>
        <p className="vf-text text-body--1">{download.long_description}</p>
      </div>
      <div className="p-4">
        <CompressedTSVTable
          download={download}
          barChartSpec={{
            title: 'AMR classes',
            subtitle: 'Number of AMRFinderPlus records in each Class',
            histogramColumn: 'Class',
            maxLabels: 0,
            labelsCol: {
              id: 'class',
              Header: 'Class',
              accessor: (row) => row[0],
            },
            countsCol: {
              id: 'Records',
              Header: 'Records',
              accessor: (row) => Number(row[1]),
            },
          }}
        />
        <p className="text-sm mt-4">
          Download this file to view the complete AMRFinderPlus results for this
          genome.
        </p>
      </div>
    </DetailedVisualisationCard>
  </div>
);

export default GenomeAmrAnalysis;
