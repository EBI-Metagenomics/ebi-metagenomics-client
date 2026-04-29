import { SampleDetail } from '@/interfaces';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';

const useSampleDetail = (accession: string) => {
  return useMgnifyResourceDetail<SampleDetail>('samples', accession);
};

export default useSampleDetail;
