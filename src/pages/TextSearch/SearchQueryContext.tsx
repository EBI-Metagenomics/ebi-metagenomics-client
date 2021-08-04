import React from 'react';
import { QueryState } from 'hooks/useQueryParamState';

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
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  setQueryParameters: (s: QueryState) => {},
});

export default SearchQueryContext;
