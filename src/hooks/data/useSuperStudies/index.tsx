import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { SuperStudyList } from 'interfaces/index';
import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useSuperStudiesList = (parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}super-studies/${
    queryString ? `?${queryString}` : ''
  }`;

  return useApiData<SuperStudyList>({
    url,
  });
};

export default useSuperStudiesList;
