import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifySourmashStatus: (
  endpoint: 'status' | '',
  jobID: string
) => MGnifyResponseGenericObj = (endpoint, jobID) => {
  const { config } = useContext(UserContext);

  const data = useData(
    endpoint.length ? `${config.api}genomes-search/${endpoint}/${jobID}` : null,
    ResponseFormat.JSON,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
  return data as MGnifyResponseGenericObj;
};

export default useMgnifySourmashStatus;
