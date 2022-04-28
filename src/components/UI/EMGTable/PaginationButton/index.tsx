import React, { MouseEventHandler } from 'react';

type PaginationButtonProps = {
  currentPageIndex: number;
  pageIndex: number;
  gotoPage: (pageIndex: number) => MouseEventHandler;
};

const PaginationButton: React.FC<PaginationButtonProps> = ({
  currentPageIndex,
  pageIndex,
  gotoPage,
}) => {
  if (currentPageIndex === pageIndex) {
    return (
      <li
        className="vf-pagination__item vf-pagination__item--is-active"
        data-cy="current-page"
      >
        <span className="vf-pagination__label" aria-current="page">
          <span className="vf-u-sr-only">Page </span>
          {currentPageIndex + 1}
        </span>
      </li>
    );
  }
  return (
    <li className="vf-pagination__item">
      <button
        type="button"
        onClick={() => gotoPage(pageIndex)}
        className="vf-button vf-button--link vf-pagination__link"
      >
        <span className="vf-u-sr-only"> page</span>
        {pageIndex + 1}
      </button>
    </li>
  );
};

export default PaginationButton;
