import React, { useContext, useMemo } from 'react';
import KeyValueList from 'components/UI/KeyValueList';
import { Link } from 'react-router-dom';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';

function isAssembly(experimentType: string): boolean {
  return ['assembly', 'hybrid_assembly', 'long_reads_assembly'].includes(
    experimentType
  );
}

type Run = {
  attributes: {
    'instrument-platform': string;
    'instrument-model': string;
  };
};

type HybridAnalysisDetailsProps = {
  assemblyId: string;
};

const HybridAnalysisDetails: React.FC<HybridAnalysisDetailsProps> = ({
  assemblyId,
}) => {
  const { loading: loadingRuns, data: runs } = useMGnifyData(
    `assemblies/${assemblyId}/runs`
  );
  const instruments = useMemo(() => {
    if (loadingRuns) return '';
    const runsData = runs.data as Run[];
    return runsData
      .map(
        (run) =>
          `${run.attributes['instrument-platform']} – ${run.attributes['instrument-model']}`
      )
      .join('\n');
  }, [loadingRuns, runs]);
  return (
    <KeyValueList
      list={[
        {
          key: 'Experiment type',
          value: 'Hybrid assembly',
        },
        {
          key: 'Instruments',
          value: instruments,
        },
      ].filter(({ value }) => !!value)}
    />
  );
};

const AnalysisOverview: React.FC = () => {
  const { overviewData: data } = useContext(AnalysisContext);
  const isHybrid = false;
    // data.experiment_type === 'hybrid_assembly' &&
    // data?.experiment_type === 'hybrid_assembly' &&
    // !!data?.relationships.assembly.data;
  return (
    <section>
      <div className="vf-stack">
        <details open>
          <summary>
            <b>Description</b>
          </summary>

          <KeyValueList
            list={[
              {
                key: 'Study',
                value:
                  // data?.relationships?.study?.data?.id &&
                  data?.study_accession &&
                  (() => (
                    <Link to={`/studies/${data?.study_accession}`}>
                      {data?.study_accession}
                    </Link>
                  )),
              },
              {
                key: 'Sample',
                value:
                  data?.sample_accession &&
                  (() => (
                    <Link to={`/samples/${data?.sample_accession}`}>
                      {data?.sample_accession}
                    </Link>
                  )),
              },
              {
                key: 'Assembly',
                value:
                  data?.assembly_accession &&
                  isAssembly(data.experiment_type as string) &&
                  (() => (
                    <Link to={`/assemblies/${data?.assembly_accession}`}>
                      {data?.assembly_accession}
                    </Link>
                  )),
              },
              {
                key: 'Run',
                value:
                  data?.run_accession &&
                  (() => (
                    <Link to={`/runs/${data?.run_accession}`}>
                      {data?.run_accession}
                    </Link>
                  )),
              },
              {
                key: 'Pipeline version',
                value:
                  data?.pipeline_version &&
                  (() => (
                    <Link to={`/pipelines/${data?.pipeline_version}`}>
                      {data?.pipeline_version}
                    </Link>
                  )),
              },
            ].filter(({ value }) => !!value)}
          />
        </details>
        <details open>
          <summary>
            <b>Experiment details</b>
          </summary>
          {!isHybrid && (
            <KeyValueList
              list={[
                {
                  key: 'Experiment type',
                  value: data?.experiment_type as string,
                },
                {
                  key: 'Instrument model',
                  value: data?.instrument_model as string,
                },
                {
                  key: 'Instrument platform',
                  value: data?.instrument_platform as string,
                },
              ].filter(({ value }) => !!value)}
            />
          )}
          {isHybrid && (
            <HybridAnalysisDetails assemblyId={data?.assembly_accession} />
          )}
        </details>
      </div>
    </section>
  );
};
export default AnalysisOverview;
