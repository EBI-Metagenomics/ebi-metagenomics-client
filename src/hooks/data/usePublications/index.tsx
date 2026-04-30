import { PublicationList } from 'interfaces/index';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const usePublicationsList = (parameters: KeyValue = {}) => {
  return useMgnifyResourceList<PublicationList>('publications', parameters);
};

export default usePublicationsList;
