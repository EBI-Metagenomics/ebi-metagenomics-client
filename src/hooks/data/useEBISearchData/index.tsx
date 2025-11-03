import { useContext } from 'react';
import useData, { DataResponse, KeyValue } from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import { isNil } from 'lodash-es';

const getDownloadURL =
  (api: string, endpoint: string, parameters: KeyValue) => (total: number) => {
    const allParameters = {
      ...parameters,
      total,
      facetcount: undefined,
      facetsdepth: undefined,
    };
    return `${api}ebi-search-download/${endpoint}?${Object.entries(
      allParameters
    )
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  };

interface EBIDataResponse extends DataResponse {
  data: KeyValue;
  getDownloadURL?: (total: number) => string;
}

const useEBISearchData: (
  endpoint: string,
  parameters?: KeyValue
) => EBIDataResponse = (endpoint, parameters = {}) => {
  const { config } = useContext(UserContext);
  const defaultParameters = {
    format: 'json',
    start: 0,
  };
  const allParemeters = { ...defaultParameters, ...parameters };
  const url = `${config.ebisearch}${endpoint}?${Object.entries(allParemeters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  const data = useData(isNil(endpoint) ? null : url);
  const dataEBI = data as EBIDataResponse;
  dataEBI.getDownloadURL = getDownloadURL(config.api, endpoint, allParemeters);
  return dataEBI;
};

export default useEBISearchData;
