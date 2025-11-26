import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from 'hooks/useURLAccession';
import useStudyAnalysesList from 'hooks/data/useStudyAnalyses';
import { Analysis, AnalysisList } from '@/interfaces';
import { ErrorFromFetch } from 'hooks/data/useData';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import { truncate } from 'lodash-es';

const expectedPageSize = 10;
type AssociatedAnaysesProps = {
  rootEndpoint: string;
};

const AnalysesTable: React.FC<AssociatedAnaysesProps> = () => {
  const accession = useURLAccession();
  const [analysesPage] = useQueryParamState<number>('analysesPage');
  // NEEDS TO BE PROVIDED BY PARENT COMPONENT

  const { data, error, loading, download } = useStudyAnalysesList(
    accession || '',
    {
      page: analysesPage,
      page_size: expectedPageSize,
    }
  );

  if (loading) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error as ErrorFromFetch} />;

  const columns = [
    {
      id: 'analysis_id',
      Header: 'Analysis accession',
      accessor: (analysis: Analysis) => analysis.accession,
      Cell: ({ cell }: { cell: { value: string } }) => (
        <Link to={`/v2-analyses/${cell.value}`}>{cell.value}</Link>
      ),
    },
    // {
    //   id: 'biome_id',
    //   Header: 'Biome',
    //   accessor: (analysis) =>
    //     samples?.[analysis?.relationships?.sample?.data?.id]?.biome || '',
    //   Cell: ({ cell }) => (
    //     <span
    //       className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
    //       style={{ float: 'initial' }}
    //     />
    //   ),
    //   className: 'mg-biome',
    // },
    {
      id: 'sample',
      Header: 'Sample accession',
      accessor: (analysis: Analysis) => analysis?.sample?.accession,
      Cell: ({ cell }) => (
        <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'sample_title',
      Header: 'Sample title',
      accessor: (analysis) => analysis?.sample?.sample_title ?? '—',
      Cell: ({ cell }) => (
        <>{truncate(decodeURI(cell.value), { length: 120 })}</>
      ),
    },
    {
      id: 'assembly_run_id',
      Header: ' Run / Assembly accession',
      accessor: (analysis: Analysis) => ({
        assembly: analysis.assembly?.accession,
        run: analysis.run?.accession,
      }),
      Cell: ({
        cell,
      }: {
        cell: { value: { assembly?: string; run?: string } };
      }) => (
        <>
          {cell.value.assembly || cell.value.run}
          {/* {cell.value.assembly && ( */}
          {/*  <Link to={`/assemblies/${cell.value.assembly}`}> */}
          {/*    {cell.value.assembly} */}
          {/*  </Link> */}
          {/* )} */}
          {/* {cell.value.run && ( */}
          {/*  <Link to={`/runs/${cell.value.run}`}>{cell.value.run}</Link> */}
          {/* )} */}
        </>
      ),
    },
    {
      id: 'pipeline_id',
      Header: 'Pipeline version',
      accessor: (analysis: Analysis) =>
        analysis.pipeline_version.toLowerCase().startsWith('v')
          ? analysis.pipeline_version.slice(1)
          : analysis.pipeline_version,
      Cell: ({ cell }: { cell: { value: string } }) => (
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
      namespace="analyses"
      showPagination={showPagination}
      onDownloadRequested={download}
      expectedPageSize={expectedPageSize}
    />
  );
};

export default AnalysesTable;
