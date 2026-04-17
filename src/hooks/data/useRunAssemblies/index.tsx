import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { AssemblyList } from '@/interfaces';
import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useRunAssemblies = (accession: string, parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}runs/${accession}/assemblies/${
    queryString ? `?${queryString}` : ''
  }`;

  return useApiData<AssemblyList>({
    url,
  });
};

export default useRunAssemblies;
