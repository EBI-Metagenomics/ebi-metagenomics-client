import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';

const initialPageSize = 10;

const getURLByEndpoint = (endpoint: string, accession: string): string => {
  if (endpoint === 'runs') return `runs/${accession}/assemblies`;
  return 'assemblies';
};
type AssociatedAssembliesProps = {
  rootEndpoint: string;
};

const AssociatedAssemblies: React.FC<AssociatedAssembliesProps> = ({
  rootEndpoint,
}) => {
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
  const url = getURLByEndpoint(rootEndpoint, accession);
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(url, {
    sample_accession: rootEndpoint === 'samples' ? accession : undefined,
    page: queryParameters['assembly-page'] as number,
    ordering: queryParameters['assembly-order'] as string,
    page_size: queryParameters['assembly-page_size'] as number,
  });
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
  if (!(data.data as MGnifyDatum[]).length) return null;

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
  const showPagination = (data.meta?.pagination?.count || 1) > initialPageSize;

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
      showPagination={showPagination}
      downloadURL={downloadURL}
    />
  );
};

export default AssociatedAssemblies;
