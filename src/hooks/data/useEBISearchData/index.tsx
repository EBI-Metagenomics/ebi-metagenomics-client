import useData, { DataResponse, KeyValue } from 'hooks/data/useData';
import config from 'config.json';

interface EBIDataResponse extends DataResponse {
  data: KeyValue;
}

const useEBISearchData: (
  endpoint: string,
  parameters?: KeyValue
) => EBIDataResponse = (endpoint, parameters = {}) => {
  const defaultParameters = {
    format: 'json',
    start: 0,
  };
  const allParemeters = { ...defaultParameters, ...parameters };
  const url = `${config.ebisearch}${endpoint}?${Object.entries(allParemeters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  const data = useData([null, undefined].includes(endpoint) ? null : url);
  return data as EBIDataResponse;
};

export default useEBISearchData;
