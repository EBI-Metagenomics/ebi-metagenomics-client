import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { SampleDetail } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';

const useSampleDetail = (accession: string) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}samples/${accession}`;

  return useApiData<SampleDetail>({
    url,
  });
};

export default useSampleDetail;
