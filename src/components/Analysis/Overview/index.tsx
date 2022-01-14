import React, { useContext } from 'react';
import KeyValueList from 'components/UI/KeyValueList';
import { Link } from 'react-router-dom';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

function isAssembly(experimentType: string): boolean {
  return ['assembly', 'hybrid_assembly', 'long_reads_assembly'].includes(
    experimentType
  );
}

const AnalysisOverview: React.FC = () => {
  const { overviewData: data } = useContext(AnalysisContext);

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
                  data.relationships?.study?.data?.id &&
                  (() => (
                    <Link to={`/studies/${data.relationships.study.data.id}`}>
                      {data.relationships.study.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Sample',
                value:
                  data.relationships?.sample?.data?.id &&
                  (() => (
                    <Link to={`/samples/${data.relationships.sample.data.id}`}>
                      {data.relationships.sample.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Assembly',
                value:
                  data.relationships?.assembly?.data?.id &&
                  isAssembly(data.attributes['experiment-type'] as string) &&
                  (() => (
                    <Link
                      to={`/assemblies/${data.relationships.assembly.data.id}`}
                    >
                      {data.relationships.assembly.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Run',
                value:
                  data.relationships?.run?.data?.id &&
                  (() => (
                    <Link to={`/runs/${data.relationships.run.data.id}`}>
                      {data.relationships.run.data.id}
                    </Link>
                  )),
              },
              {
                key: 'Pipeline version',
                value:
                  data.attributes?.['pipeline-version'] &&
                  (() => (
                    <Link
                      to={`/pipelines/${data.attributes['pipeline-version']}`}
                    >
                      {data.attributes['pipeline-version']}
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
          <KeyValueList
            list={[
              // TODO: the lists should obtained from runs for hybrid_assembly
              {
                key: 'Experiment type',
                value: data.attributes['experiment-type'] as string,
              },
              {
                key: 'Instrument model',
                value: data.attributes['instrument-model'] as string,
              },
              {
                key: 'Instrument platform',
                value: data.attributes['instrument-platform'] as string,
              },
            ].filter(({ value }) => !!value)}
          />
        </details>
      </div>
    </section>
  );
};
export default AnalysisOverview;
