/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const BrowsePublications: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [search] = useQueryParamState('search', '');
  const [hasData, setHasData] = useState(false);
  const {
    data: publicationsList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('publications', {
    page,
    ordering: order,
    page_size: pageSize,
    search: (search as string) || undefined,
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
  if (!publicationsList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={publicationsList as MGnifyResponseList}
          Title={`Publications (${publicationsList.meta.pagination.count})`}
          initialPage={(page as number) - 1}
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
