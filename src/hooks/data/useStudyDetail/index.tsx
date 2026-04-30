import { StudyDetail } from 'interfaces/index';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';

const useStudyDetail = (accession: string) => {
  return useMgnifyResourceDetail<StudyDetail>('studies', accession);
};

export default useStudyDetail;
