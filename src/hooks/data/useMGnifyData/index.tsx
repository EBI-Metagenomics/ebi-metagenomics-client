import { useContext } from 'react';
import useData, {
  DataResponse,
  MGnifyResponse,
  KeyValue,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

interface MgnifyDataResponse extends DataResponse {
  data: MGnifyResponse;
}

const useMGnifyData: (
  endpoint: string,
  parameters?: KeyValue,
  fetchOptions?: RequestInit
) => MgnifyDataResponse = (endpoint, parameters = {}, fetchOptions = {}) => {
  const { config } = useContext(UserContext);
  const defaultParameters = {};
  const allParemeters = { ...defaultParameters, ...parameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParemeters).length > 0)
    url += `?${Object.entries(allParemeters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  const data = useData(
    [null, undefined].includes(endpoint) ? null : url,
    ResponseFormat.JSON,
    fetchOptions
  );
  return data as MgnifyDataResponse;
};

export default useMGnifyData;
