import React, { useContext } from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import { ResponseFormat } from 'hooks/data/useData';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import QualityControlChart from './V2QCChart';
import ContigsHistogram from './V2ContigsHistogram';
import NucleotidesHistogram from './NucleotidesHistogram';
import ContigsDistribution from './V2ContigsDistribution';
import SeqLengthChart from './SeqLengthChart';
import GCContentChart from './GCContentChart';

import './style.css';

const QualityControl: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  // const accession = analysisData?.id;
  const accession = analysisData?.accession;
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/summary`,
    {},
    {},
    ResponseFormat.TSV
  );
  console.log('data gotten back ', data);
  if (loading) return <Loading size="large" />;
  const summaryData =
    error || !data
      ? null
      : Object.fromEntries(data as unknown as Array<[k: string, v: string]>);

  const isAssembly = analysisData?.experiment_type === 'assembly';
  const unit = isAssembly ? 'contig' : 'read';
  const units = isAssembly ? 'contigs' : 'reads';

  return (
    <div className="vf-stack vf-stack--200" data-cy="run-qc-chart">
      <p>
        The chart below shows the number of {units} which pass the quality
        control steps in the pipeline. Paired-end sequences may have been
        merged, in which case the initial number of {units} may differ from the
        number given by ENA.
      </p>
      <QualityControlChart summaryData={summaryData} />
    </div>
  );
};

export default QualityControl;
