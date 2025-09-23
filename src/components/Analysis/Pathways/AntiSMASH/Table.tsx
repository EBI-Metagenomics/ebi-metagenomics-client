import React, { useContext } from 'react';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';

const PAGE_SIZE = 25;

const { useAntismashPage, useAntismashPageSize, withQueryParamProvider } =
  createSharedQueryParamContextForTable('antismash', {}, PAGE_SIZE);

const AntiSMASHTable: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [page] = useAntismashPage<number>();
  const [pageSize] = useAntismashPageSize<number>();
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `analyses/${overviewData.id}/antismash-gene-clusters`,
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
      Header: 'Description',
      accessor: 'attributes.description',
    },
    {
      Header: 'Count',
      accessor: 'attributes.count',
    },
  ];
  if (loading && (!isStale || !data)) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  return (
    <EMGTable
      cols={columns}
      data={data}
      initialPageSize={PAGE_SIZE}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      showPagination
      downloadURL={downloadURL}
      namespace="antismash"
    />
  );
};

export default withQueryParamProvider(AntiSMASHTable);
