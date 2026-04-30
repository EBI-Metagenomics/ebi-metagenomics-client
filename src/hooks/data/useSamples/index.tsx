import { SampleList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useSamplesList = (parameters: KeyValue = {}) => {
  return useMgnifyResourceList<SampleList>('samples', parameters);
};

export default useSamplesList;
