import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifySourmashSearch: (
  endpoint: 'gather' | '',
  catalogues: string[],
  signatures: { [filename: string]: string }
) => MGnifyResponseGenericObj = (endpoint, catalogues, signatures) => {
  const { config } = useContext(UserContext);
  const formdata = new FormData();
  catalogues.forEach((cat) => formdata.append('mag_catalogues', cat));
  Object.entries(signatures || {}).forEach(([filename, signature]) => {
    formdata.append(
      'file_uploaded',
      new Blob([signature], {
        type: 'text/plain',
      }),
      filename
    );
  });
  const data = useData(
    endpoint.length && catalogues.length && Object.keys(signatures || {}).length
      ? `${config.api}genomes-search/${endpoint}`
      : null,
    ResponseFormat.JSON,
    {
      method: 'POST',
      body: formdata,
    }
  );
  return data as MGnifyResponseGenericObj;
};

export default useMgnifySourmashSearch;
