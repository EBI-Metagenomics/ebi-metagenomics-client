import { KeyValue } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { AnalysisDetail } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';

const useAnalysesDetail = (id?: string, parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url =
    id &&
    `${config.api_v2}analyses/${id}${queryString ? `?${queryString}` : ''}`;

  return useApiData<AnalysisDetail>({
    url,
  });
};

export default useAnalysesDetail;
