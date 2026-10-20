import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from 'hooks/useURLAccession';
import useStudyAnalysesList from 'hooks/data/useStudyAnalyses';
import useRunAnalysesList from 'hooks/data/useRunAnalysesList';
import useAssemblyAnalysesList from 'hooks/data/useAssemblyAnalysesList';
import { Analysis, AnalysisList } from '@/interfaces';
import { ErrorFromFetch } from 'hooks/data/useData';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { truncate } from 'lodash-es';

const expectedPageSize = 10;
type AssociatedAnaysesProps = {
  rootEndpoint: string;
};

const {
  useAnalysesPage,
  useAnalysesPageSize,
  useAnalysesOrder,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable('analyses', {}, expectedPageSize);

const AnalysesTable: React.FC<AssociatedAnaysesProps> = ({ rootEndpoint }) => {
  const accession = useURLAccession();
  const [analysesPage] = useAnalysesPage<number>();
  const [analysesPageSize] = useAnalysesPageSize<number>();
  const [analysesOrder] = useAnalysesOrder<string>();

  const useAnalysesHook = useMemo(() => {
    switch (rootEndpoint) {
      case 'runs':
        return useRunAnalysesList;
      case 'assemblies':
        return useAssemblyAnalysesList;
      default:
        return useStudyAnalysesList;
    }
  }, [rootEndpoint]);

  const { data, error, loading, download } = useAnalysesHook(accession || '', {
    page: analysesPage,
    page_size: analysesPageSize,
    ordering: analysesOrder,
  });

  if (loading) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error as ErrorFromFetch} />;

  const columns = [
    {
      id: 'analysis_id',
      header: 'Analysis accession',
      accessorFn: (analysis: Analysis) => analysis.accession,
      cell: ({ cell }: { cell: { getValue: () => string } }) => (
        <Link to={`/analyses/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
    // {
    //   id: 'biome_id',
    //   Header: 'Biome',
    //   accessor: (analysis) =>
    //     samples?.[analysis?.relationships?.sample?.data?.id]?.biome || '',
    //   cell: ({ cell }) => (
    //     <span
    //       className={`biome_icon icon_xs ${getBiomeIcon(cell.getValue())}`}
    //       style={{ float: 'initial' }}
    //     />
    //   ),
    //   className: 'mg-biome',
    // },
    {
      id: 'sample',
      header: 'Sample accession',
      accessorFn: (analysis: Analysis) => analysis?.sample?.accession,
      cell: ({ cell }) => (
        <Link to={`/samples/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
    {
      id: 'sample_title',
      header: 'Sample title',
      accessorFn: (analysis) => analysis?.sample?.sample_title ?? '—',
      cell: ({ cell }) => (
        <>{truncate(decodeURI(cell.getValue()), { length: 120 })}</>
      ),
    },
    {
      id: 'assembly_run_id',
      header: ' Run / Assembly accession',
      accessorFn: (analysis: Analysis) => ({
        assembly: analysis.assembly?.accession,
        run: analysis.run?.accession,
      }),
      cell: ({
        cell,
      }: {
        cell: { getValue: () => { assembly?: string; run?: string } };
      }) => (
        <>
          {/*{cell.getValue().assembly || cell.getValue().run}*/}
          {cell.getValue().assembly && (
            <Link to={`/assemblies/${cell.getValue().assembly}`}>
              {cell.getValue().assembly}
            </Link>
          )}
          {cell.getValue().run && (
            <Link to={`/runs/${cell.getValue().run}`}>
              {cell.getValue().run}
            </Link>
          )}
        </>
      ),
    },
    {
      id: 'pipeline_id',
      header: 'Pipeline version',
      accessorFn: (analysis: Analysis) =>
        analysis.pipeline_version.toLowerCase().startsWith('v')
          ? analysis.pipeline_version.slice(1)
          : analysis.pipeline_version,
      cell: ({ cell }: { cell: { getValue: () => string } }) => (
        <Link to={`/pipelines/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
  ];
  const showPagination = (data.count || 1) > expectedPageSize;
  return (
    <EMGTable
      sortable={true}
      cols={columns}
      data={data as AnalysisList}
      Title={
        <div>
          Analyses
          <span className="mg-number">{data.count || 0}</span>
        </div>
      }
      initialPage={(analysesPage as number) - 1}
      initialPageSize={expectedPageSize}
      className="mg-anlyses-table"
      loading={loading}
      namespace="analyses"
      showPagination={showPagination}
      onDownloadRequested={download}
      expectedPageSize={expectedPageSize}
    />
  );
};

export default withQueryParamProvider(AnalysesTable);
