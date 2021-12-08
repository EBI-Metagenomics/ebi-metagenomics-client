import React from 'react';
import { QueryState } from 'hooks/useQueryParamState';
import { noop } from 'lodash-es';

const ContigsQueryContext = React.createContext({
  contigsQueryData: {
    data: null,
    loading: false,
    error: null,
  },
  queryParameters: {} as QueryState,
  setQueryParameters: noop as (s: QueryState) => void,
});

export default ContigsQueryContext;
