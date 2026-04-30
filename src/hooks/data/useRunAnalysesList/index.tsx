import { AnalysisList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useRunAnalysesList = (accession: string, parameters: KeyValue = {}) => {
  return useMgnifyResourceList<AnalysisList>(
    `runs/${accession}/analyses`,
    parameters
  );
};

export default useRunAnalysesList;
