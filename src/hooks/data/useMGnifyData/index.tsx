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
  downloadURL?: string;
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
  const allParameters = { ...defaultParameters, ...cleanedParameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParameters).length > 0) {
    Object.entries(allParameters).forEach(([key, value], idx) => {
      let joinChar = idx === 0 ? '?' : '&';
      if (key.includes('[]')) {
        (value as string)
          .split(',')
          .forEach((repeatedParamValue, repeatedParamIdx) => {
            if (repeatedParamIdx > 0) {
              joinChar = '&';
            }
            url += `${joinChar}${key}=${repeatedParamValue}`;
          });
      } else {
        url += `${joinChar}${key}=${value}`;
      }
    });
  }

  const data = useData(endpoint ? url : '', format, fetchOptions);
  const dataM = data as MgnifyDataResponse;

  const parametersWithoutPagination = Object.entries(allParameters).filter(
    ([key]) => key.indexOf('page') === -1
  );
  parametersWithoutPagination.push(['format', 'csv']);
  let downloadURL = `${config.api}${endpoint}`;
  if (parametersWithoutPagination.length > 0)
    downloadURL += `?${parametersWithoutPagination
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  dataM.downloadURL = downloadURL;
  return dataM;
};

export default useMGnifyData;
