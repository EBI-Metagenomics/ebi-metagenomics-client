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

  const onSubmit = (e) => {
    e.preventDefault();
    setQueryParameters({
      ...queryParameters,
      query: searchTerms,
    });
  };

  return (
    <form
      className="vf-form vf-form--search vf-sidebar vf-sidebar--end mg-text-search"
      onSubmit={onSubmit}
    >
      <div className="vf-sidebar__inner">
        <div className="vf-form__item | vf-search__item">
          <input
            type="text"
            placeholder="Enter your search terms"
            id="mg-text-search"
            className="vf-form__input | st-default-search-input mg-text-search-textfield"
            value={searchTerms}
            onChange={(evt) => {
              setSearchTerms(evt.target.value);
            }}
          />
        </div>
        <div className="vf-form__item | vf-search__item">
          <button
            type="submit"
            className="vf-search__button | vf-button vf-button--primary mg-text-search-button"
            onClick={onSubmit}
          >
            <span className="vf-button__text">Search </span>
            <span className="icon icon-common icon-search" />
          </button>
          <button
            type="button"
            className="vf-search__button | vf-button vf-button--tertiary mg-text-search-clear"
            onClick={() => {
              setQueryParameters({});
            }}
          >
            <span className="vf-button__text">Clear All </span>
            <span className="icon icon-common icon-times-circle" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default TextSearch;
