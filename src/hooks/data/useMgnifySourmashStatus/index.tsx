import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifySourmashStatus: (
  endpoint: 'status' | '',
  catalog: string,
  jobID: string
) => MGnifyResponseGenericObj = (endpoint, catalog, jobID) => {
  const { config } = useContext(UserContext);

  const data = useData(
    endpoint.length && catalog.length
      ? `${config.api}genomes-search/${endpoint}/${jobID}`
      : null,
    ResponseFormat.JSON,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
  return data as MGnifyResponseGenericObj;
};

export default useMgnifySourmashStatus;
