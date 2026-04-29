import { AssemblyList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useRunAssemblies = (accession: string, parameters: KeyValue = {}) => {
  return useMgnifyResourceList<AssemblyList>(
    `runs/${accession}/assemblies`,
    parameters
  );
};

export default useRunAssemblies;
