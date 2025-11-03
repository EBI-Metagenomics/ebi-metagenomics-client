import React from 'react';
import { AnalysisDetail } from '@/interfaces';

export type AnalysisContextType = {
  overviewData?: AnalysisDetail;
};

const AnalysisContext = React.createContext<AnalysisContextType>({
  overviewData: undefined,
});

export default AnalysisContext;
