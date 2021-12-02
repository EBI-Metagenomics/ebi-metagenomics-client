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
  fetchOptions?: RequestInit,
  format?: ResponseFormat
) => MgnifyDataResponse = (
  endpoint,
  parameters = {},
  fetchOptions = {},
  format = ResponseFormat.JSON
) => {
  const { config } = useContext(UserContext);
  const defaultParameters = {};
  const cleanedParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined)
  );
  const allParemeters = { ...defaultParameters, ...cleanedParameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParemeters).length > 0)
    url += `?${Object.entries(allParemeters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  const data = useData(
    [null, undefined].includes(endpoint) ? null : url,
    format,
    fetchOptions
  );
  return data as MgnifyDataResponse;
};

export default useMGnifyData;
