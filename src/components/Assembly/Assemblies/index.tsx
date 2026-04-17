import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useRunAssemblies from '@/hooks/data/useRunAssemblies';
import { ErrorFromFetch, MGnifyResponseList } from '@/hooks/data/useData';
import { Assembly } from '@/interfaces';
import useURLAccession from '@/hooks/useURLAccession';
import InfoBanner from 'components/UI/InfoBanner';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';

const initialPageSize = 10;

type AssociatedAssembliesProps = {
  rootEndpoint: string;
};

const {
  useAssembliesPage,
  useAssembliesPageSize,
  useAssembliesOrder,
  useAssembliesSearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable(
  'assemblies',
  {
    assembliesSearch: SharedTextQueryParam(''),
  },
  initialPageSize
);

const AssociatedAssemblies: React.FC<AssociatedAssembliesProps> = ({
  rootEndpoint: _rootEndpoint,
}) => {
  const accession = useURLAccession();
  const [assemblyPage] = useAssembliesPage<number>();
  const [assemblyFilter] = useAssembliesSearch<string>();
  const [assemblyPageSize] = useAssembliesPageSize<number>();
  const [assemblyOrder] = useAssembliesOrder<string>();

  const { data, loading, error, stale, download } = useRunAssemblies(
    accession as string,
    {
      page: assemblyPage as number,
      ordering: assemblyOrder as string,
      page_size: assemblyPageSize as number,
      search: assemblyFilter as string,
    }
  );
  if (loading && stale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error as ErrorFromFetch} />;
  if (!(data.items as Assembly[]).length && !assemblyFilter)
    return <InfoBanner type="info" title="No associated assemblies found." />;

  const columns = [
    {
      Header: 'Assembly ID',
      id: 'accession',
      accessor: 'accession',
      Cell: ({ cell }) => (
        <Link to={`/v2-assemblies/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Run',
      accessor: 'run_accession',
      Cell: ({ cell }) => <Link to={`/runs/${cell.value}`}>{cell.value}</Link>,
    },
    {
      Header: 'Sample',
      accessor: 'sample_accession',
      Cell: ({ cell }) => (
        <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Assembler',
      id: 'assembler',
      accessor: (row: Assembly) =>
        `${row.assembler_name} (${row.assembler_version})`,
    },
    {
      Header: 'Coverage',
      accessor: 'metadata.coverage',
      Cell: ({ cell }) => <>{(cell.value as number).toFixed(2)}</>,
    },
    {
      Header: 'Coverage Depth',
      accessor: 'metadata.coverage_depth',
      Cell: ({ cell }) => <>{(cell.value as number).toFixed(2)}</>,
    },
    {
      Header: 'Updated at',
      accessor: 'updated_at',
      Cell: ({ cell }) => <>{new Date(cell.value).toLocaleDateString()}</>,
    },
  ];
  const showPagination = (data.count || 1) > initialPageSize;

  return (
    <EMGTable
      cols={columns}
      data={data.items as unknown as MGnifyResponseList}
      Title={
        <div>
          Assemblies
          <span className="mg-number">{data.count || 0}</span>
        </div>
      }
      initialPage={(assemblyPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-assembly-table"
      loading={loading}
      isStale={stale}
      sortable
      showTextFilter
      namespace="assembly-"
      showPagination={showPagination}
      downloadURL={download}
    />
  );
};

export default withQueryParamProvider(AssociatedAssemblies);
