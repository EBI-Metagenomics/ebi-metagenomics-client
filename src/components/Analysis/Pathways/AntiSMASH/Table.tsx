import React, { useContext } from 'react';

import EMGTable from 'components/UI/EMGTable';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import useMGnifyData from 'hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

const PAGE_SIZE = 25;

const AntiSMASHTable: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      page_size: PAGE_SIZE,
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `analyses/${overviewData.id}/antismash-gene-clusters`,
    {
      page: queryParameters.page as number,
      page_size: queryParameters.page_size as number,
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
      initialPage={(queryParameters.page as number) - 1}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      showPagination
      downloadURL={downloadURL}
    />
  );
};

export default AntiSMASHTable;
