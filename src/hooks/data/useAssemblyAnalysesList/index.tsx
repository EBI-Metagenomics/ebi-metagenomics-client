import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { AnalysisList } from 'interfaces';
import useApiData from 'hooks/data/useApiData';
import { KeyValue } from 'hooks/data/useData';

const useStudyAnalysesList = (accession: string, parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}assemblies/${accession}/analyses${
    queryString ? `?${queryString}` : ''
  }`;

  return useApiData<AnalysisList>({
    url,
  });
};

export default useStudyAnalysesList;
