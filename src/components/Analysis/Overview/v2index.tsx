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
  console.log('OVERVIEW DARA', data);

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
                  data?.relationships?.study?.data?.id &&
                  (() => (
                    <Link to={`/studies/${data?.relationships.study.data.id}`}>
                      {data?.relationships.study.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Sample',
                value:
                  data?.relationships?.sample?.data?.id &&
                  (() => (
                    <Link to={`/samples/${data?.relationships.sample.data.id}`}>
                      {data?.relationships.sample.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Assembly',
                value:
                  data?.relationships?.assembly?.data?.id &&
                  isAssembly(data.experiment_type as string) &&
                  (() => (
                    <Link
                      to={`/assemblies/${data?.relationships.assembly.data.id}`}
                    >
                      {data?.relationships.assembly.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Run',
                value:
                  data?.relationships?.run?.data?.id &&
                  (() => (
                    <Link to={`/runs/${data?.relationships.run.data.id}`}>
                      {data?.relationships.run.data.id}
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
            <HybridAnalysisDetails
              assemblyId={data?.relationships?.assembly?.data?.id}
            />
          )}
        </details>
      </div>
    </section>
  );
};
export default AnalysisOverview;
