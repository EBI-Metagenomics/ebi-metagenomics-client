import React, { useContext } from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import { ResponseFormat } from 'hooks/data/useData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import QualityControlChart from './QCChart';
import ContigsHistogram from './ContigsHistogram';
import NucleotidesHistogram from './NucleotidesHistogram';
import ContigsDistribution from './ContigsDistribution';
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
      {summaryData && Number(analysisData.attributes['pipeline-version']) > 2 && (
        <>
          <p>
            The histograms below show the distributions of sequence lengths
            (left) and percentage GC content (right) for the sequences having
            passed quality control. Note that for large files, the distributions
            were compiled from a random subset of 2 million
            {units}. The standard deviations are shown on each plot. The bar
            chart underneath each graph indicates the minimum, mean and maximum
            length and mean GC and AT content, respectively.
          </p>
          <div className="vf-grid vf-grid__col-2">
            <div className="vf-stack">
              <ContigsHistogram summaryData={summaryData} />
              <SeqLengthChart summaryData={summaryData} />
            </div>
            <div className="vf-stack">
              <ContigsDistribution summaryData={summaryData} />
              <GCContentChart summaryData={summaryData} />
            </div>
          </div>
          <p>
            The graph below show the relative abundance of nucletotides (A, C,
            G, T, or ambiguous base &quot;N&quot;) at each position starting
            from the beginning of each {unit} up to the first 500 base pairs.
          </p>
          <NucleotidesHistogram />
        </>
      )}
    </div>
  );
};

export default QualityControl;
