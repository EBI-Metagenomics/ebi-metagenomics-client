import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import usePublicationsList from 'hooks/data/usePublications';
import FetchError from 'components/UI/FetchError';

const { usePage, usePageSize, useOrder, useSearch, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

const BrowsePublications: React.FC = () => {
  const [page] = usePage<number>();
  const [order] = useOrder<string>();
  const [pageSize] = usePageSize<number>();
  const [search] = useSearch<string>();
  const [hasData, setHasData] = useState(false);
  const {
    data: publicationsList,
    loading,
    error,
    stale,
  } = usePublicationsList({
    page,
    pageSize,
    order,
    title: search,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'pubmed_id',
        Header: 'PMID',
        accessor: 'pubmed_id',
        Cell: ({ cell }) => (
          <ExtLink href={`https://europepmc.org/abstract/MED/${cell.value}`}>
            {cell.value}
          </ExtLink>
        ),
        disableSortBy: true,
      },
      {
        Header: 'Publication title',
        accessor: 'title',
        disableSortBy: true,
      },
      // {
      //   Header: 'Studies',
      //   accessor: 'attributes.studies-count',
      // },
      {
        Header: 'Year of pub.',
        accessor: 'published_year',
      },
      {
        id: 'link',
        Header: 'Link',
        accessor: 'pubmed_id',
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
  if (error) return <FetchError error={error} />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={publicationsList}
          Title={`Publications (${publicationsList.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={stale}
          showTextFilter
          // downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowsePublications);
