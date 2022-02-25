import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import InfoBanner from 'src/components/UI/InfoBanner';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

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
  const [assemblyPage] = useQueryParamState('assembly-page', 1, Number);
  const [assemblyPageSize] = useQueryParamState(
    'assembly-page_size',
    initialPageSize,
    Number
  );
  const [assemblyOrder] = useQueryParamState('assembly-order', '');
  const url = getURLByEndpoint(rootEndpoint, accession);
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(url, {
    sample_accession: rootEndpoint === 'samples' ? accession : undefined,
    page: assemblyPage as number,
    ordering: assemblyOrder as string,
    page_size: assemblyPageSize as number,
  });
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
  if (!(data.data as MGnifyDatum[]).length)
    return <InfoBanner type="info" title="No associated assemblies found." />;

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
      initialPage={(assemblyPage as number) - 1}
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
