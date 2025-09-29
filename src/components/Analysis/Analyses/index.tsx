import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from '@/hooks/useURLAccession';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import InfoBanner from 'components/UI/InfoBanner';
import { singularise } from 'utils/strings';
import useStudyAnalysesList from 'hooks/data/useStudyAnalyses';
import useAssemblyAnalysesList from 'hooks/data/useAssemblyAnalysesList';
import { Analysis, AnalysisList } from '@/interfaces';

const expectedPageSize = 100;
type AssociatedAnaysesProps = {
  rootEndpoint: string;
};

const AnalysesTable: React.FC<AssociatedAnaysesProps> = ({ rootEndpoint }) => {
  const accession = useURLAccession();
  const singularNamespace = singularise(rootEndpoint);
  const [analysesPage] = useQueryParamState('analyses-page', 1, Number);

  const hook =
    rootEndpoint === 'assemblies'
      ? useAssemblyAnalysesList
      : useStudyAnalysesList;

  const {
    data,
    error,
    loading,
    url: downloadURL,
  } = hook(accession || '', {
    page: analysesPage,
  });

  if (loading) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  if (!data.count)
    return (
      <InfoBanner
        type="info"
        title={`The ${singularNamespace} has no analyses.`}
      />
    );

  const columns = [
    {
      id: 'analysis_id',
      Header: 'Analysis accession',
      accessor: (analysis: Analysis) => analysis.accession,
      Cell: ({ cell }) => (
        <Link to={`/v2-analyses/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'sample',
      Header: 'Sample accession',
      accessor: (analysis) => analysis?.sample?.accession,
    },
    {
      id: 'assembly_run_id',
      Header: ' Run / Assembly accession',
      accessor: (analysis: Analysis) => ({
        assembly: analysis.assembly?.accession,
        run: analysis.run?.accession,
      }),
      Cell: ({ cell }) => <span>{cell.value.assembly || cell.value.run}</span>,
    },
    {
      id: 'pipeline_id',
      Header: 'Pipeline version',
      accessor: (analysis: Analysis) =>
        analysis.pipeline_version.toLowerCase().startsWith('v')
          ? analysis.pipeline_version.slice(1)
          : analysis.pipeline_version,
      Cell: ({ cell }) => (
        <Link to={`/pipelines/${cell.value}`}>{cell.value}</Link>
      ),
    },
  ];
  const showPagination = (data.count || 1) > expectedPageSize;
  return (
    <EMGTable
      cols={columns}
      data={data as AnalysisList}
      Title={
        <div>
          Analyses
          <span className="mg-number">{data.count || 1}</span>
        </div>
      }
      initialPage={(analysesPage as number) - 1}
      className="mg-anlyses-table"
      loading={loading}
      namespace="analyses-"
      showPagination={showPagination}
      downloadURL={downloadURL}
    />
  );
};

export default AnalysesTable;
