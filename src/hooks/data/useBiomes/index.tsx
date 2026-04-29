import { BiomeList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useBiomesList = (parameters: KeyValue = {}) => {
  return useMgnifyResourceList<BiomeList>('biomes', parameters);
};

export default useBiomesList;
