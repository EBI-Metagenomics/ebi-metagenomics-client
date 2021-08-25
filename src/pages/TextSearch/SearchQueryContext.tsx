import React from 'react';
import { QueryState } from 'hooks/useQueryParamState';
import { noop } from 'lodash-es';

const SearchQueryContext = React.createContext({
  searchData: {
    '/search/studies': {
      data: null,
      loading: false,
      error: null,
    },
    '/search/samples': {
      data: null,
      loading: false,
      error: null,
    },
    '/search/analyses': {
      data: null,
      loading: false,
      error: null,
    },
  },
  queryParameters: {} as QueryState,
  setQueryParameters: noop as (s: QueryState) => void,
});

export default SearchQueryContext;
