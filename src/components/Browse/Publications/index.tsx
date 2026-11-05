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
        header: 'PMID',
        accessorKey: 'pubmed_id',
        cell: ({ cell }) => (
          <ExtLink
            href={`https://europepmc.org/abstract/MED/${cell.getValue()}`}
          >
            {cell.getValue()}
          </ExtLink>
        ),
        enableSorting: false,
      },
      {
        header: 'Publication title',
        accessorKey: 'title',
        enableSorting: false,
      },
      // {
      //   Header: 'Studies',
      //   accessor: 'attributes.studies-count',
      // },
      {
        header: 'Year of pub.',
        accessorKey: 'published_year',
      },
      {
        id: 'link',
        header: 'Link',
        accessorKey: 'pubmed_id',
        cell: ({ cell }) => (
          <Link
            to={`/publications/${cell.getValue()}`}
            className="vf-button vf-button--primary vf-button--sm "
          >
            View details
          </Link>
        ),
        enableSorting: false,
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
          data={publicationsList ?? []}
          Title={`Publications (${publicationsList?.count ?? 0})`}
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
