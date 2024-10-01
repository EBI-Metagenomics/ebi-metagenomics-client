import React, { useEffect, useState } from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import { clearParams } from '@/hooks/queryParamState/QueryParamStore/queryParamReducer';

const TextSearch: React.FC = () => {
  const [query, setQuery, { actionDispatcher }] = useQueryParamState(
    'query',
    ''
  );
  const [searchTerms, setSearchTerms] = useState(query as string);
  useEffect(() => {
    setSearchTerms(query as string);
  }, [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    setQuery(searchTerms);
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
            className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
            onClick={onSubmit}
          >
            <span className="vf-button__text">Search </span>
            <span className="icon icon-common icon-search" />
          </button>
          <button
            type="button"
            className="vf-search__button | vf-button vf-button--tertiary mg-text-search-clear vf-button--sm"
            onClick={() => {
              actionDispatcher(clearParams({}));
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
