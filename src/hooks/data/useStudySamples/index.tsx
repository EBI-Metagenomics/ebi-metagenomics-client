import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { SampleList } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useStudySamplesList = (accession: string, parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}studies/${accession}/samples/${
    queryString ? `?${queryString}` : ''
  }`;

  return useApiData<SampleList>({
    url,
  });
};

export default useStudySamplesList;
