import React, { useContext } from 'react';

import type { Download } from '@/interfaces';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import ExtLink from 'components/UI/ExtLink';

const RheaTab: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const dataFile: Download | undefined = analysisData?.downloads.find(
    (file) => file.download_group === 'functional_annotation.rhea_reactions'
  );

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
        <p>No Rhea reactions file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>Rhea reactions</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            <ExtLink href="https://www.rhea-db.org/" title="Rhea website">
              Rhea
            </ExtLink>{' '}
            is an expert-curated knowledgebase of biochemical reactions. This
            table shows reactions assigned to proteins in this analysis.
          </p>
          <p className="text-sm">
            Download this file to view the complete Rhea reaction annotations
            for this analysis.
          </p>
        </div>
        <CompressedTSVTable download={dataFile} />
      </DetailedVisualisationCard>
    </div>
  );
};

export default RheaTab;
