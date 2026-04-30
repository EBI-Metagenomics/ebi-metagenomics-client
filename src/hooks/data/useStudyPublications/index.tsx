import { PublicationList } from '@/interfaces';
import { KeyValue } from 'hooks/data/useData';
import useMgnifyResourceList from 'hooks/data/useMgnifyResourceList';

const useStudyPublicationsList = (
  accession: string,
  parameters: KeyValue = {}
) => {
  return useMgnifyResourceList<PublicationList>(
    `studies/${accession}/publications`,
    parameters
  );
};

export default useStudyPublicationsList;
