/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import ReactMarkdown from 'react-markdown';

const BrowseSuperStudies: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [biome] = useQueryParamState('biome', 'root');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [hasData, setHasData] = useState(false);
  const {
    data: superStudiesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('super-studies', {
    page,
    ordering: order,
    lineage: biome,
    page_size: pageSize,
  });

  const columns = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'attributes.title',
        Cell: ({ cell }) => (
          <Link
            to={`/super-studies/${cell.row.original.attributes['url-slug']}`}
          >
            {cell.value}
          </Link>
        ),
      },
      {
        Header: 'Description',
        accessor: 'attributes.description',
        disableSortBy: true,
        Cell: ({ cell }) => (
          <ReactMarkdown>{cell.value as string}</ReactMarkdown>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!superStudiesList);
  }, [superStudiesList]);
  if (!superStudiesList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={superStudiesList as MGnifyResponseList}
          Title={`Super Studies (${superStudiesList.meta.pagination.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          showPagination={false}
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseSuperStudies;
