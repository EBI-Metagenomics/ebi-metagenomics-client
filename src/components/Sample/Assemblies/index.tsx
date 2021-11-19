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

const AssociatedAssemblies: React.FC = () => {
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'assembly-page': 1,
      'assembly-page_size': initialPageSize,
      'assembly-order': '',
    },
    {
      'assembly-page': Number,
      'assembly-page_size': Number,
    }
  );
  const { data, loading, error, isStale } = useMGnifyData(`assemblies`, {
    sample_accession: accession,
    page: queryParameters['assembly-page'] as number,
    ordering: queryParameters['assembly-order'] as string,
    page_size: queryParameters['assembly-page_size'] as number,
  });
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const columns = [
    {
      Header: 'Assembly ID',
      accessor: 'id',
      Cell: ({ cell }) => (
        <Link to={`/assemblies/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Experiment type',
      accessor: 'attributes.experiment-type',
    },
    {
      Header: 'WGS ID',
      accessor: 'attributes.wgs-accession',
    },
    {
      Header: 'Legacy ID',
      accessor: 'attributes.legacy-accession',
    },
    {
      Header: 'Pipeline versions',
      accessor: 'relationships.pipelines.data',
      Cell: ({ cell }) =>
        (cell.value as { id: string }[]).map(({ id }) => id).join(', '),
    },
  ];

  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(queryParameters['assembly-page'] as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-assembly-table"
      loading={loading}
      isStale={isStale}
      namespace="assembly-"
    />
  );
};

export default AssociatedAssemblies;
