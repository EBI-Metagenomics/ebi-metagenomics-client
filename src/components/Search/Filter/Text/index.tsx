import React, { useEffect, useState, useContext } from 'react';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';

const TextSearch: React.FC = () => {
  const { queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [searchTerms, setSearchTerms] = useState(
    queryParameters.query as string
  );
  useEffect(() => {
    setSearchTerms(queryParameters.query as string);
  }, [queryParameters.query]);
  return (
    <div className="vf-form vf-form--search vf-form--search--responsive vf-sidebar vf-sidebar--end">
      <div className="vf-sidebar__inner">
        <div className="vf-form__item | vf-search__item">
          <input
            type="text"
            placeholder="Enter your search terms"
            id="text"
            className="vf-form__input | st-default-search-input"
            value={searchTerms}
            onChange={(evt) => {
              setSearchTerms(evt.target.value);
            }}
          />
        </div>

        <button
          type="button"
          className="vf-search__button | vf-button vf-button--primary"
          onClick={() => {
            setQueryParameters({
              ...queryParameters,
              query: searchTerms,
            });
          }}
        >
          <span className="vf-button__text">Search </span>
          <span className="icon icon-common icon-search" />
        </button>
        <button
          type="button"
          className="vf-search__button | vf-button vf-button--tertiary"
          onClick={() => {
            setQueryParameters({});
          }}
        >
          <span className="vf-button__text">Clear All </span>
          <span className="icon icon-common icon-times-circle" />
        </button>
      </div>
    </div>
  );
};

export default TextSearch;
