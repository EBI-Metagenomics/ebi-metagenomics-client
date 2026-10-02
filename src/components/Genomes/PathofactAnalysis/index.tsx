import React from 'react';
import type { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';

type GenomePathofactAnalysisProps = {
  download: Download;
};

const GenomePathofactAnalysis: React.FC<GenomePathofactAnalysisProps> = ({
  download,
}) => (
  <div className="vf-stack" data-cy="genome-pathofact">
    <DetailedVisualisationCard ftpLink={download.url} title={download.alias}>
      <div className="p-4">
        <h5>{download.short_description}</h5>
        <p className="vf-text text-body--1">{download.long_description}</p>
      </div>
      <div className="p-4">
        <CompressedTSVTable download={download} />
        <p className="text-sm mt-4">
          Download this file to view the complete PathoFact results for this
          genome.
        </p>
      </div>
    </DetailedVisualisationCard>
  </div>
);

export default GenomePathofactAnalysis;
