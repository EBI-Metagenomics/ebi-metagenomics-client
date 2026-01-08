import React from 'react';

interface AnalysisContextType {
  overviewData: Record<string, unknown> | null;
  included: Record<string, unknown> | null;
}

const AnalysisContext = React.createContext<AnalysisContextType>({
  overviewData: null,
  included: null,
});

export default AnalysisContext;
