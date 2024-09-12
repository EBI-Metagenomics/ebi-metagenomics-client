import { useContext } from 'react';
import useData, {
  DataResponse,
  KeyValue,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import useDataV2 from 'hooks/data/useDataV2';

interface Download {
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
}

interface MgnifyV2DataResponse extends DataResponse {
  study_accession?: string;
  accession?: string;
  downloads?: Download[];
  downloadURL?: string;
}

const useMGnifyV2Data: (
  endpoint: string,
  parameters?: KeyValue,
  fetchOptions?: RequestInit,
  format?: ResponseFormat
) => MgnifyV2DataResponse = (
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

  // const data = useData(
  //   [null, undefined].includes(endpoint) ? null : url,
  //   format,
  //   fetchOptions
  // );

  const data = useDataV2(url, format, fetchOptions);

  const dataM = data as any;

  // Extract the study accession, accession, and downloads from the response data
  if (dataM.data) {
    console.log('DATAM DATA', dataM.data);
    // dataM.study_accession = dataM.data.study_accession;
    dataM.accession = dataM.data.accession;
    dataM.downloads = dataM.data.downloads || [];
  }

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

export default useMGnifyV2Data;
