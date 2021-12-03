/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';

const BrowsePublications: React.FC = () => {
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      page_size: 25,
      search: '',
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: publicationsList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('publications', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    page_size: queryParameters.page_size as number,
    search: (queryParameters.search as string) || undefined,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'pubmed_id',
        Header: 'PMID',
        accessor: 'id',
        Cell: ({ cell }) => (
          <ExtLink href={`https://europepmc.org/abstract/MED/${cell.value}`}>
            {cell.value}
          </ExtLink>
        ),
      },
      {
        Header: 'Publication title',
        accessor: 'attributes.pub-title',
        disableSortBy: true,
      },
      {
        Header: 'Studies',
        accessor: 'attributes.studies-count',
      },
      {
        Header: 'Year of pub.',
        accessor: 'attributes.published-year',
      },
      {
        Header: 'Link',
        accessor: 'attributes.pubmed-id',
        Cell: ({ cell }) => (
          <Link
            to={`/publications/${cell.value}`}
            className="vf-button vf-button--primary vf-button--sm "
          >
            View details
          </Link>
        ),
        disableSortBy: true,
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!publicationsList);
  }, [publicationsList]);

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={publicationsList as MGnifyResponseList}
          title={`Publications (${publicationsList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          showTextFilter
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowsePublications;
