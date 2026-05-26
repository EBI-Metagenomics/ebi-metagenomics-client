import { AssemblyList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useSampleAssemblies = (accession: string, parameters: KeyValue = {}) => {
  return useMgnifyResourceList<AssemblyList>(
    `samples/${accession}/assemblies`,
    parameters
  );
};

export default useSampleAssemblies;
