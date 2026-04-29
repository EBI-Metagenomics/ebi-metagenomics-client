import { SampleList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useStudySamplesList = (accession: string, parameters: KeyValue = {}) => {
  return useMgnifyResourceList<SampleList>(
    `studies/${accession}/samples`,
    parameters
  );
};

export default useStudySamplesList;
