/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';

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
  } = useMGnifyData('super-studies', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    lineage: queryParameters.biome as string,
    page_size: queryParameters.page_size as number,
  });

  const columns = React.useMemo(
    () => [
      // {
      //   id: 'study_id',
      //   Header: 'Accession',
      //   accessor: 'attributes.accession',
      //   Cell: ({ cell }) => (
      //     <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
      //   ),
      // },
      {
        Header: 'Title',
        accessor: 'attributes.title',
        Cell: ({ cell }) => {
          console.log();
          return (
            <Link
              to={`/super-studies/${cell.row.original.attributes['url-slug']}`}
            >
              {cell.value}
            </Link>
          );
        },
      },
      {
        Header: 'Description',
        accessor: 'attributes.description',
        disableSortBy: true,
      },
      // {
      //   id: 'last_update',
      //   Header: 'Last Updated',
      //   accessor: 'attributes.last-update',
      //   Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
      // },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!superStudiesList);
  }, [superStudiesList]);

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={superStudiesList as MGnifyResponseList}
          title={`Studies (${superStudiesList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          showPagination={false}
        />
      )}
    </section>
  );
};

export default BrowseSuperStudies;
