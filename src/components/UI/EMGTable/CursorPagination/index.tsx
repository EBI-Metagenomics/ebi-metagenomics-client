import { KeyValue } from '@/hooks/data/useData';
import React from 'react';

type EMGTableProps = {
  paginationLinks: KeyValue;
  handleCursor: (cursor: string) => void;
};

const pageCursorFromPaginationURL = (linkURL): string => {
  return linkURL.split('cursor=')[1].split('&')[0];
};

const CursorPagination: React.FC<EMGTableProps> = ({
  paginationLinks,
  handleCursor,
}) => {
  const canPreviousPage = !!paginationLinks.prev;
  const canNextPage = !!paginationLinks.next;

  return (
    <section className="mg-table-footer">
      <nav className="vf-pagination" aria-label="Pagination">
        <ul className="vf-pagination__list">
          <li className="vf-pagination__item vf-pagination__item--previous-page">
            <button
              disabled={!canPreviousPage}
              type="button"
              onClick={() =>
                handleCursor(pageCursorFromPaginationURL(paginationLinks.prev))
              }
              className="vf-button vf-button--link vf-pagination__link"
            >
              Previous<span className="vf-u-sr-only"> page</span>
            </button>
          </li>

          <li className="vf-pagination__item vf-pagination__item--next-page">
            <button
              disabled={!canNextPage}
              type="button"
              onClick={() =>
                handleCursor(pageCursorFromPaginationURL(paginationLinks.next))
              }
              className="vf-button vf-button--link vf-pagination__link"
            >
              Next<span className="vf-u-sr-only"> page</span>
            </button>
          </li>
        </ul>
      </nav>
    </section>
  );
};

export default CursorPagination;
