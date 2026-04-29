import { SuperStudyList } from 'interfaces/index';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useSuperStudiesList = (parameters: KeyValue = {}) => {
  return useMgnifyResourceList<SuperStudyList>('super-studies', parameters);
};

export default useSuperStudiesList;
