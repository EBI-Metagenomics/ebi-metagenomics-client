import React from 'react';

const ContigsQueryContext = React.createContext({
  contigsQueryData: {
    data: null,
    loading: false,
    error: null,
  },
});

export default ContigsQueryContext;
