import React, { useMemo } from 'react';
import { Download } from '@/interfaces';
import KeggModule from 'components/Analysis/Pathways/KeggModule';

type GenomeKeggPathwayAnalysisProps = {
  downloads: Download[];
};

const isKeggPathwayCompleteness = (download: Download) => {
  const searchable = [
    download.alias,
    download.short_description,
    download.long_description,
    download.url,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    download.file_type === 'tsv' &&
    searchable.includes('kegg') &&
    searchable.includes('pathway') &&
    (searchable.includes('completeness') ||
      searchable.includes('_kegg_pathways.tsv'))
  );
};

const GenomeKeggPathwayAnalysis: React.FC<GenomeKeggPathwayAnalysisProps> = ({
  downloads,
}) => {
  const keggPathwayDownloads = useMemo(
    () => downloads.filter(isKeggPathwayCompleteness),
    [downloads]
  );

  return (
    <KeggModule
      dataFiles={keggPathwayDownloads}
      barChartColumnIndexes={{ label: 0, count: 1 }}
    />
  );
};

export default GenomeKeggPathwayAnalysis;
