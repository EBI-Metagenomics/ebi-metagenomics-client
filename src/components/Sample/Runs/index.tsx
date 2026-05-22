import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from '@/hooks/useURLAccession';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';
import { RunList } from '@/interfaces';

const initialPageSize = 10;

const {
  useRunsPage,
  useRunsPageSize,
  useRunsOrder,
  useRunsSearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable(
  'runs',
  {
    runsSearch: SharedTextQueryParam(''),
  },
  initialPageSize
);

const AssociatedRuns: React.FC = () => {
  const accession = useURLAccession();
  const [runsPage] = useRunsPage<number>();
  const [runsPageSize] = useRunsPageSize<number>();
  const [runsOrder] = useRunsOrder<string>();
  const [runsFilter] = useRunsSearch<string>();
  const { data, loading, error, stale, download } =
    useMgnifyResourceList<RunList>(`samples/${accession}/runs`, {
      page: runsPage as number,
      ordering: runsOrder as string,
      page_size: runsPageSize as number,
      search: runsFilter as string,
    });

  if (loading && !stale) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const columns = [
    {
      id: 'accession',
      Header: 'Run ID',
      accessor: 'accession',
      Cell: ({ cell }) => <Link to={`/runs/${cell.value}`}>{cell.value}</Link>,
    },
    {
      Header: 'Experiment type',
      accessor: 'experiment_type',
      disableSortBy: true,
    },
    {
      Header: 'Instrument model',
      accessor: 'instrument_model',
      disableSortBy: true,
    },
    {
      Header: 'Instrument platform',
      accessor: 'instrument_platform',
      disableSortBy: true,
    },
  ];

  return (
    <EMGTable
      cols={columns}
      data={data}
      initialPage={(runsPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-runs-table"
      loading={loading}
      isStale={stale}
      sortable
      showTextFilter
      namespace="runs"
      onDownloadRequested={download}
    />
  );
};

export default withQueryParamProvider(AssociatedRuns);
