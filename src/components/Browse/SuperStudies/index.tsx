/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import Loading from 'components/UI/Loading';

const BrowseSuperStudies: React.FC = () => {
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      biome: 'root',
      page_size: 25,
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: superStudiesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('super-studies', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    lineage: queryParameters.biome as string,
    page_size: queryParameters.page_size as number,
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
          title={`Super Studies (${superStudiesList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
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
