import React from 'react';

const SearchQueryContext = React.createContext({
  searchData: {
    '/search/studies': {
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
});

export default SearchQueryContext;
