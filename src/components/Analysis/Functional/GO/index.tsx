import React, { useContext } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import LegacyFunctionalTable from '../LegacyFunctionalTable';

type GOProps = {
  isLegacy?: boolean;
  legacyFile?: Download | string;
};

const GO: React.FC<GOProps> = ({ isLegacy, legacyFile }) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const dataFile: Download | undefined = analysisData?.downloads.find(
    (file) => file.download_group === 'functional_annotation.go_slims'
  );

  if (isLegacy) {
    if (!legacyFile) {
      return (
        <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
          <p>No GO identifiers file available</p>
        </div>
      );
    }
    const url = typeof legacyFile === 'string' ? legacyFile : legacyFile.url;
    const title =
      typeof legacyFile === 'string' ? 'GO summary' : legacyFile.alias;
    const description =
      typeof legacyFile === 'string' ? '' : legacyFile.short_description;

    return (
      <div className="vf-stack">
        <h5>Gene Ontology terms</h5>
        <DetailedVisualisationCard ftpLink={url} title={title}>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Gene Ontology (GO) terms describe gene product functions and
              relationships in any organism.
            </p>
          </div>
          <LegacyFunctionalTable url={url} title={description} type="go" />
        </DetailedVisualisationCard>
      </div>
    );
  }

  if (!dataFile) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-tsv-table">
        <p>No GO identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <h5>Gene Ontology terms</h5>
      <DetailedVisualisationCard ftpLink={dataFile.url} title={dataFile.alias}>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Gene Ontology (GO) terms describe gene product functions and
            relationships in any organism.
          </p>
          <p className="text-sm">
            Download this file to view the complete GO term annotations for this
            analysis.
          </p>
        </div>
        <CompressedTSVTable
          download={dataFile}
          columnHeaders={['GO', 'Term']}
          barChartSpec={{
            title: 'GO Terms',
            labelsCol: {
              id: 'go_term',
              Header: 'Term',
              accessor: (d) => `${d[0]}: ${d[1]}`,
            },
            countsCol: {
              id: 'count',
              Header: 'Count',
              accessor: (d) => Number(d[2]),
            },
          }}
        />
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70" />
    </div>
  );
};

export default GO;
