/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import ReactMarkdown from 'react-markdown';
import FetchError from 'components/UI/FetchError';
import useSuperStudiesList from 'hooks/data/useSuperStudies';

const BrowseSuperStudies: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [hasData, setHasData] = useState(false);

  const { data, loading, error } = useSuperStudiesList({
    page,
    pageSize,
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
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          showPagination={false}
          // downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseSuperStudies;
