import React, { useContext } from 'react';
import KeyValueList, { KeyValueItemsList } from 'components/UI/KeyValueList';
import { Link } from 'react-router-dom';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import '../style.css';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import { extractVersionNumber } from 'utils/strings';
import UserContext from 'pages/Login/UserContext';

function isAssembly(experimentType: string): boolean {
  // return ['assembly', 'hybrid_assembly', 'long_reads_assembly'].includes(
  return ['ASSEM', 'HYASS', 'LRASS'].includes(experimentType);
}

// type HybridAnalysisDetailsProps = {
//   assemblyId: string;
// };

// const HybridAnalysisDetails: React.FC<HybridAnalysisDetailsProps> = ({
//   assemblyId,
// }) => {
//   const { loading: loadingRuns, data: runs } = useMGnifyData(
//     `assemblies/${assemblyId}/runs`
//   );
//   const instruments = useMemo(() => {
//     if (loadingRuns) return '';
//     const runsData = runs.data as Run[];
//     return runsData
//       .map(
//         (run) =>
//           `${run.attributes['instrument-platform']} – ${run.attributes['instrument-model']}`
//       )
//       .join('\n');
//   }, [loadingRuns, runs]);
//   return (
//     <KeyValueList
//       list={[
//         {
//           key: 'Experiment type',
//           value: 'Hybrid assembly',
//         },
//         {
//           key: 'Instruments',
//           value: instruments,
//         },
//       ].filter(({ value }) => !!value)}
//     />
//   );
// };

const AnalysisOverview: React.FC = () => {
  const { overviewData: data } = useContext(AnalysisContext);
  const { config } = useContext(UserContext);

  const isHybrid = false;
  // data.experiment_type === 'hybrid_assembly' &&
  // data?.experiment_type === 'hybrid_assembly' &&
  // !!data?.relationships.assembly.data;

  const descriptionItems = [
    {
      key: 'Study',
      value:
        data?.study_accession &&
        (() => (
          <Link to={`/studies/${data?.study_accession}`}>
            {data?.study_accession}
          </Link>
        )),
      rawValue: data?.study_accession || '',
    },
    {
      key: 'Sample',
      value:
        data?.sample?.accession &&
        (() => (
          <Link to={`/samples/${data?.sample?.accession}`}>
            {data?.sample?.accession}
          </Link>
        )),
      rawValue: data?.sample?.accession || '',
    },
    {
      key: 'Assembly',
      value:
        data?.assembly?.accession &&
        isAssembly(data.experiment_type as string) &&
        (() => (
          <Link to={`/assemblies/${data?.assembly?.accession}`}>
            {data?.assembly?.accession}
          </Link>
        )),
      rawValue: data?.assembly?.accession || '',
    },
    {
      key: 'Run',
      value: data?.run?.accession || '',
      // data?.run?.accession &&
      // (() => (
      //   <Link to={`/runs/${data?.run?.accession}`}>
      //     {data?.run?.accession}
      //   </Link>
      // )),
      rawValue: data?.run?.accession || '',
    },
    {
      key: 'Results folder',
      value:
        data?.results_dir &&
        (() => (
          <a href={data.results_dir} target="_blank" rel="noreferrer">
            {data.results_dir}
          </a>
        )),
      rawValue: data?.results_dir || '',
    },
  ];

  const experimentDetailsItems = [
    {
      key: 'Experiment type',
      value: data?.experiment_type as string,
      rawValue: data?.experiment_type || '',
    },
    {
      key: 'Instrument model',
      value: data?.read_run?.instrument_model as string,
      rawValue: data?.read_run?.instrument_model || '',
    },
    {
      key: 'Instrument platform',
      value: data?.read_run?.instrument_platform as string,
      rawValue: data?.read_run?.instrument_platform || '',
    },
  ];

  const pipelineSetMeta =
    config.pipelines[data?.pipeline_version.toLowerCase() || ''] || {};
  const pipelineMeta = data
    ? pipelineSetMeta[data.experiment_type.toLowerCase()]
    : config.pipelines['default']['default'];

  const pipelineInformationItems = [
    {
      key: 'Repository',
      value: () => (
        <ul className="vf-list vf-list--bare">
          {pipelineMeta.githubs?.map((repo) => (
            <li key={repo}>
              <a href={repo} target="_blank" rel="noreferrer">
                {repo}
              </a>
            </li>
          ))}
        </ul>
      ),
      rawValue: pipelineMeta.githubs?.join(', ') || '—',
    },
    {
      key: 'Documentation',
      value: () => (
        <ul className="vf-list vf-list--bare">
          {pipelineMeta.docs?.map((doc) => (
            <li key={doc}>
              <a href={doc} target="_blank" rel="noreferrer">
                {doc}
              </a>
            </li>
          ))}
        </ul>
      ),
      rawValue: pipelineMeta.docs?.join(', ') || '—',
    },
    {
      key: 'WorkflowHub link',
      value: () => (
        <ul className="vf-list vf-list--bare">
          {pipelineMeta.workflowHubs?.map((pipeline) => (
            <li key={pipeline}>
              <a href={pipeline} target="_blank" rel="noreferrer">
                {pipeline}
              </a>
            </li>
          ))}
        </ul>
      ),
      rawValue: pipelineMeta.workflowHubs?.join(', ') || '—',
    },
    {
      key: 'Pipeline version',
      value:
        data?.pipeline_version &&
        (() => (
          <Link
            to={`/pipelines/${extractVersionNumber(
              data?.pipeline_version ?? ''
            )}`}
          >
            {data?.pipeline_version}
          </Link>
        )),
      rawValue: data?.pipeline_version || '',
    },
  ];

  const generateCsv = () => {
    let csvContent = 'Category,Key,Value\n';
    descriptionItems
      .filter(({ value }) => !!value)
      .forEach((item) => {
        csvContent += `Description,${item.key},"${String(item.rawValue).replace(
          /"/g,
          '""'
        )}"\n`;
      });

    experimentDetailsItems
      .filter(({ value }) => !!value)
      .forEach((item) => {
        csvContent += `Experiment details,${item.key},"${String(
          item.rawValue
        ).replace(/"/g, '""')}"\n`;
      });

    pipelineInformationItems
      .filter(({ value }) => !!value)
      .forEach((item) => {
        csvContent += `Pipeline information,${item.key},"${String(
          item.rawValue
        ).replace(/"/g, '""')}"\n`;
      });

    return csvContent;
  };

  const handleDownloadCsv = () => {
    const csvContent = generateCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `analysis_overview_${
      data?.run?.accession || 'data'
    }.csv`;
    downloadLink.style.display = 'none';
    downloadLink.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <section>
      <div className="vf-stack">
        <DetailedVisualisationCard
          title="Overview"
          subheading="Analysis details"
          showCopyButton={false}
          showZoomButton={false}
          onDownloadClick={handleDownloadCsv}
        >
          <details className="vf-details custom-vf-details" open>
            <summary className="vf-details--summary custom-vf-details--summary">
              <b>Description</b>
            </summary>
            <div>
              <KeyValueList
                list={
                  descriptionItems.filter(
                    ({ value }) => !!value
                  ) as KeyValueItemsList
                }
              />
            </div>
          </details>
          <details className="vf-details custom-vf-details" open>
            <summary className="vf-details--summary custom-vf-details--summary">
              <b>Experiment details</b>
            </summary>
            {!isHybrid && (
              <KeyValueList
                list={experimentDetailsItems.filter(({ value }) => !!value)}
              />
            )}
            {isHybrid && (
              <p>Hybrid assembly details are not available yet.</p>
              // TODO: add hybrid assembly details
              // <HybridAnalysisDetails assemblyId={data?.assembly?.accession} />
            )}
          </details>
          <details className="vf-details custom-vf-details" open>
            <summary className="vf-details--summary custom-vf-details--summary">
              <b>Pipeline information</b>
            </summary>
            <KeyValueList
              list={
                pipelineInformationItems.filter(
                  ({ value }) => !!value
                ) as KeyValueItemsList
              }
            />
          </details>
        </DetailedVisualisationCard>
      </div>
    </section>
  );
};
export default AnalysisOverview;
