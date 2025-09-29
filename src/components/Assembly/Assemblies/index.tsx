import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { ErrorFromFetch, MGnifyDatum, MGnifyResponseList } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import InfoBanner from 'components/UI/InfoBanner';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';

const initialPageSize = 10;

const getURLByEndpoint = (endpoint: string, accession: string): string => {
  if (endpoint === 'runs') return `runs/${accession}/assemblies`;
  return 'assemblies';
};
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
  rootEndpoint,
}) => {
  const accession = useURLAccession();
  const [assemblyPage] = useAssembliesPage<number>();
  const [assemblyFilter] = useAssembliesSearch<string>();
  const [assemblyPageSize] = useAssembliesPageSize<number>();
  const [assemblyOrder] = useAssembliesOrder<string>();
  const url = getURLByEndpoint(rootEndpoint, accession as string);
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(url, {
    sample_accession: rootEndpoint === 'samples' ? (accession as string) : '',
    page: assemblyPage as number,
    ordering: assemblyOrder as string,
    page_size: assemblyPageSize as number,
    search: assemblyFilter as string,
  });
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error as ErrorFromFetch} />;
  if (!(data.data as MGnifyDatum[]).length && !assemblyFilter)
    return <InfoBanner type="info" title="No associated assemblies found." />;

  const columns = [
    {
      Header: 'Assembly ID',
      id: 'accession',
      accessor: 'id',
      Cell: ({ cell }) => (
        <Link to={`/assemblies/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Experiment type',
      accessor: 'attributes.experiment-type',
      disableSortBy: true,
    },
    {
      Header: 'WGS ID',
      accessor: 'attributes.wgs-accession',
      disableSortBy: true,
    },
    {
      Header: 'Legacy ID',
      accessor: 'attributes.legacy-accession',
      disableSortBy: true,
    },
    {
      Header: 'Pipeline versions',
      accessor: 'relationships.pipelines.data',
      disableSortBy: true,
      Cell: ({ cell }) => (
        <>{(cell.value as { id: string }[]).map(({ id }) => id).join(', ')}</>
      ),
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
      sortable
      showTextFilter
      namespace="assembly-"
      showPagination={showPagination}
      downloadURL={downloadURL}
    />
  );
};

export default withQueryParamProvider(AssociatedAssemblies);
