import React from 'react';

interface AnalysisContextType {
  overviewData: Record<string, any> | null;
  included: Record<string, any> | null;
}

const AnalysisContext = React.createContext<AnalysisContextType>({
  overviewData: null,
  included: null,
});

export default AnalysisContext;
