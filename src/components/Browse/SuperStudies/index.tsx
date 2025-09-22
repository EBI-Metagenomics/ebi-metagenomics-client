/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import ReactMarkdown from 'react-markdown';
import FetchError from 'components/UI/FetchError';
import useSuperStudiesList from 'hooks/data/useSuperStudies';

const {usePage, usePageSize, withQueryParamProvider} = createSharedQueryParamContextForTable();

const BrowseSuperStudies: React.FC = () => {
  console.log('BrowseSuperStudies');
  const [page] = usePage<number>();
  const [pageSize] = usePageSize<number>();
  const [hasData, setHasData] = useState(false);
  const { data, loading, error, download } = useSuperStudiesList({
    page,
    page_size: pageSize,
  });

  const columns = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
        disableSortBy: true,
        Cell: ({ cell }) => (
          <Link to={`/super-studies/${cell.row.original.slug}`}>
            {cell.value}
          </Link>
        ),
      },
      {
        Header: 'Description',
        accessor: 'description',
        disableSortBy: true,
        Cell: ({ cell }) => (
          <ReactMarkdown>{cell.value as string}</ReactMarkdown>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!data?.items);
  }, [data]);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={data}
          Title={`Super Studies (${data.count})`}
          initialPage={page}
          sortable
          loading={loading}
          showPagination={false}
          onDownloadRequested={download}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseSuperStudies);
