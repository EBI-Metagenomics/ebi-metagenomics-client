import { SuperStudyDetail } from 'interfaces/index';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';

const useSuperStudyDetail = (slug: string | undefined) => {
  return useMgnifyResourceDetail<SuperStudyDetail>(
    'super-studies',
    slug as string
  );
};

export default useSuperStudyDetail;
