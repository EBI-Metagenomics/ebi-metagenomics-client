import React, { useContext } from 'react';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';

const PAGE_SIZE = 25;

const { useKeggPage, useKeggPageSize, withQueryParamProvider } =
  createSharedQueryParamContextForTable('kegg', {}, PAGE_SIZE);

const KeggTable: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [page] = useKeggPage<number>();
  const [pageSize] = useKeggPageSize<number>();
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `analyses/${overviewData.id}/kegg-modules`,
    {
      page: page as number,
      page_size: pageSize as number,
    }
  );
  const columns = [
    {
      Header: 'Class ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: 'attributes.name',
    },
    {
      Header: 'Description',
      accessor: 'attributes.description',
    },
    {
      Header: 'Completeness',
      accessor: 'attributes.completeness',
    },
    {
      Header: 'Matching KO',
      accessor: 'attributes.matching-kos.length',
    },
    {
      Header: 'Missing KOs',
      accessor: 'attributes.missing-kos.length',
    },
  ];
  if (loading && (!isStale || !data)) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  return (
    <EMGTable
      cols={columns}
      data={data}
      initialPageSize={PAGE_SIZE}
      initialPage={(page as number) - 1}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      showPagination
      downloadURL={downloadURL}
      namespace="kegg"
    />
  );
};

export default withQueryParamProvider(KeggTable);
