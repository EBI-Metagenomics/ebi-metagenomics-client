import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { RunDetail } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';

const useRunDetail = (accession: string) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}runs/${accession}`;

  return useApiData<RunDetail>({
    url,
  });
};

export default useRunDetail;
