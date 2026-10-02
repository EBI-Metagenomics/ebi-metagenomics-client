import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from '@/hooks/data/useData';
import normaliseSourmashSignature from '@/utils/normaliseSourmashSignature';
import UserContext from 'pages/Login/UserContext';

const useMgnifySourmashSearch: (
  endpoint: 'gather' | '',
  catalogues: string[],
  signatures: { [filename: string]: string }
) => MGnifyResponseGenericObj = (endpoint, catalogues, signatures) => {
  const { config } = useContext(UserContext);

  const formdata = new FormData();

  catalogues.forEach((cat) => {
    formdata.append('mag_catalogues', cat);
  });

  Object.entries(signatures || {}).forEach(([filename, signature]) => {
    const normalisedSignature = normaliseSourmashSignature(
      signature,
      'sourmash'
    );

    formdata.append(
      'file_uploaded',
      new Blob([normalisedSignature], {
        type: 'text/plain',
      }),
      filename
    );
  });

  const shouldSendRequest =
    endpoint.length &&
    catalogues.length &&
    Object.keys(signatures || {}).length;

  const data = useData(
    shouldSendRequest ? `${config.api_v2}genomes-search/${endpoint}/` : null,
    ResponseFormat.JSON,
    {
      method: 'POST',
      body: formdata,
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return data as MGnifyResponseGenericObj;
};

export default useMgnifySourmashSearch;
