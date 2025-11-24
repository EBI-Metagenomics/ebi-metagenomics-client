import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { BiomeList } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useBiomesList = (parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}biomes/${queryString ? `?${queryString}` : ''}`;

  return useApiData<BiomeList>({
    url,
  });
};

export default useBiomesList;
