import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';

const initialPageSize = 10;

const AssociatedRuns: React.FC = () => {
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'runs-page': 1,
      'runs-page_size': initialPageSize,
      'runs-order': '',
    },
    {
      'runs-page': Number,
      'runs-page_size': Number,
    }
  );
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `samples/${accession}/runs`,
    {
      page: queryParameters['runs-page'] as number,
      ordering: queryParameters['runs-order'] as string,
      page_size: queryParameters['runs-page_size'] as number,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const columns = [
    {
      id: 'run',
      Header: 'Run ID',
      accessor: 'id',
      Cell: ({ cell }) => <Link to={`/runs/${cell.value}`}>{cell.value}</Link>,
    },
    {
      Header: 'Experiment type',
      accessor: 'attributes.experiment-type',
    },
    {
      Header: 'Instrument model',
      accessor: 'attributes.instrument-model',
    },
    {
      Header: 'Instrument platform',
      accessor: 'attributes.instrument-platform',
    },
    {
      Header: 'pipeline versions',
      accessor: 'relationships.pipelines.data',
      Cell: ({ cell }) =>
        (cell.value as { id: string }[]).map(({ id }) => id).join(', '),
    },
  ];

  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(queryParameters['runs-page'] as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-runs-table"
      loading={loading}
      isStale={isStale}
      namespace="runs-"
      downloadURL={downloadURL}
    />
  );
};

export default AssociatedRuns;
