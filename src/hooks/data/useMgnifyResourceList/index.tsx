import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useMgnifyResourceList = <T,>(
  resource: string,
  parameters: KeyValue = {}
) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}${resource}/${
    queryString ? `?${queryString}` : ''
  }`;

  return useApiData<T>({
    url,
  });
};

export default useMgnifyResourceList;
