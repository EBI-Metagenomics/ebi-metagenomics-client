import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const initialPageSize = 10;

const AssociatedRuns: React.FC = () => {
  const accession = useURLAccession();
  const [runsPage] = useQueryParamState('runs-page', 1, Number);
  const [runsPageSize] = useQueryParamState(
    'runs-page_size',
    initialPageSize,
    Number
  );
  const [runsOrder] = useQueryParamState('runs-order', '');
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `samples/${accession}/runs`,
    {
      page: runsPage as number,
      ordering: runsOrder as string,
      page_size: runsPageSize as number,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const columns = [
    {
      id: 'accession',
      Header: 'Run ID',
      accessor: 'id',
      Cell: ({ cell }) => <Link to={`/runs/${cell.value}`}>{cell.value}</Link>,
    },
    {
      Header: 'Experiment type',
      accessor: 'attributes.experiment-type',
      disableSortBy: true,
    },
    {
      Header: 'Instrument model',
      accessor: 'attributes.instrument-model',
      disableSortBy: true,
    },
    {
      Header: 'Instrument platform',
      accessor: 'attributes.instrument-platform',
      disableSortBy: true,
    },
    {
      Header: 'Pipeline versions',
      accessor: 'relationships.pipelines.data',
      disableSortBy: true,
      Cell: ({ cell }) =>
        (cell.value as { id: string }[]).map(({ id }) => id).join(', '),
    },
  ];

  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(runsPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-runs-table"
      loading={loading}
      isStale={isStale}
      sortable
      namespace="runs-"
      downloadURL={downloadURL}
    />
  );
};

export default AssociatedRuns;
