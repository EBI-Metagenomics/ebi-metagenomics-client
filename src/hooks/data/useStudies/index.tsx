import { StudyList } from 'interfaces/index';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useStudiesList = (parameters: KeyValue = {}) => {
  return useMgnifyResourceList<StudyList>('studies', parameters);
};

export default useStudiesList;
