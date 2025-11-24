import React from 'react';
import { MGnifyResponse } from 'hooks/data/useData';

const ContigsQueryContext = React.createContext<{
  contigsQueryData: {
    data: MGnifyResponse | null;
    loading: boolean;
    error: any;
  };
}>({
  contigsQueryData: {
    data: null,
    loading: false,
    error: null,
  },
});

export default ContigsQueryContext;
