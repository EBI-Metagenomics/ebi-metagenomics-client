import { AnalysisList } from 'interfaces/index';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useStudyAnalysesList = (accession: string, parameters: KeyValue = {}) => {
  return useMgnifyResourceList<AnalysisList>(
    `studies/${accession}/analyses`,
    parameters
  );
};

export default useStudyAnalysesList;
