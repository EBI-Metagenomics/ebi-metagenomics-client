import React, { useContext } from 'react';
import AnalysisContext, {
  AnalysisContextType,
} from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import { first, last, sortBy } from 'lodash-es';

const InterPro: React.FC = () => {
  const { overviewData: analysisData } =
    useContext<AnalysisContextType>(AnalysisContext);

  let dataFiles: Download[] | undefined = analysisData?.downloads.filter(
    (file) => file.download_group === 'functional_annotation.interpro'
  );
  if (dataFiles) {
    dataFiles = sortBy(dataFiles, (file) => file.index_files?.length).reverse();
  }

  if (!dataFiles) {
    return (
      <div className="vf-stack vf-stack--200" data-cy="assembly-interpro-chart">
        <p>No InterPro identifiers file available</p>
      </div>
    );
  }

  return (
    <div className="vf-stack">
      <p className="text-sm text-gray-600 mb-4">
        InterPro is a database of protein families, domains, and functional
        sites. It provides functional analysis of proteins by classifying them
        into families and predicting the presence of domains and sites.
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
                  title: 'interpro',
                  labelsCol: {
                    id: 'interpro_accession',
                    Header: 'Interpro identifier',
                    accessor: first,
                  },
                  countsCol: {
                    id: 'count',
                    Header: 'Count',
                    accessor: (d) => Number(last(d)),
                  },
                }}
              />
              <p className="text-sm">
                Download this file to view the complete InterPro annotations for
                this analysis.
              </p>
            </>
          )}
        </DetailedVisualisationCard>
      ))}
    </div>
  );
};

export default InterPro;
