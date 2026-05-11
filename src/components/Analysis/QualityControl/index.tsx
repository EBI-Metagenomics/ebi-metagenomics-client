import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';

import Loading from 'components/UI/Loading';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import protectedAxios from '@/utils/protectedAxios';
import QualityControlChart from './QCChart';
import ContigsHistogram from './ContigsHistogram';
import NucleotidesHistogram from './NucleotidesHistogram';
import ContigsDistribution from './ContigsDistribution';
import SeqLengthChart from './SeqLengthChart';
import GCContentChart from './GCContentChart';

import './style.css';

const QualityControl: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const resultsDir = analysisData?.results_dir;
  const pipelineVersion = analysisData?.pipeline_version;

  const isVersion41 = pipelineVersion === 'V4.1';
  const isVersion50 = pipelineVersion === 'V5';
  const isSupportedVersion = isVersion41 || isVersion50;

  const [summaryData, setSummaryData] = useState<{
    [key: string]: string;
  } | null>(null);
  const [qcStepData, setQcStepData] = useState<{
    [key: string]: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<any>(null);

  const summaryPath = `${resultsDir}/qc-statistics/summary.out`;
  const qcStepPath = isVersion41
    ? `${resultsDir}/qc-statistics/summary.out`
    : `${resultsDir}/qc_summary`;

  useEffect(() => {
    if (resultsDir && isSupportedVersion) {
      setLoading(true);
      const fetchSummary = protectedAxios.get(summaryPath);
      const fetchQcStep = protectedAxios.get(qcStepPath).catch(() => ({
        data: '',
      }));

      Promise.all([fetchSummary, fetchQcStep])
        .then(([summaryResponse, qcStepResponse]) => {
          const summaryText = summaryResponse.data;
          const parsedSummary = summaryText
            .split('\n')
            .filter(Boolean)
            .map((line) => line.split('\t'));
          setSummaryData(Object.fromEntries(parsedSummary));

          const qcStepText = qcStepResponse.data;
          const parsedQcStep = qcStepText
            .split('\n')
            .filter(Boolean)
            .map((line) => line.split('\t'));
          setQcStepData(Object.fromEntries(parsedQcStep));

          setLoading(false);
        })
        .catch((err) => {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.setItem('mgnify.sessionExpired', 'true');
            window.location.reload();
          }
          setError(err);
          setLoading(false);
        });
    }
  }, [summaryPath, qcStepPath, resultsDir, isSupportedVersion]);

  if (loading) return <Loading size="large" />;

  if (!analysisData) return <Loading />;

  if (!isSupportedVersion) {
    return (
      <div className="vf-stack vf-stack--200">
        <p>
          QC files can be found from the{' '}
          <a href={resultsDir} target="_blank" rel="noopener noreferrer">
            results directory
          </a>
        </p>
      </div>
    );
  }

  const isAssembly = analysisData.experiment_type
    .toLowerCase()
    .endsWith('assembly');
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
      <QualityControlChart summaryData={summaryData} qcStepData={qcStepData} />
      {summaryData && (
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
