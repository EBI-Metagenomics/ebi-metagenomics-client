import React, { useContext } from 'react';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const PAGE_SIZE = 25;

const PfamTable: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [page] = useQueryParamState('page', 1, Number);
  const [pageSize] = useQueryParamState('page_size', PAGE_SIZE, Number);
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `analyses/${overviewData.id}/pfam-entries`,
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
      initialPage={(page as number) - 1}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      showPagination
      downloadURL={downloadURL}
    />
  );
};

export default PfamTable;
