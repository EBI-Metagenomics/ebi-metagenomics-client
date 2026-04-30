import { RunDetail } from '@/interfaces';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';

const useRunDetail = (accession: string) => {
  return useMgnifyResourceDetail<RunDetail>('runs', accession);
};

export default useRunDetail;
