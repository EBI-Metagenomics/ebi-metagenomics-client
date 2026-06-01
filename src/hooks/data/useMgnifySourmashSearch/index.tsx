import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const normaliseSourmashSignature = (signature: string): string => {
  try {
    const parsedSignature = JSON.parse(signature);

    /**
     * First request format:
     *
     * [
     *   {
     *     "class": "sourmash_signature",
     *     ...
     *   }
     * ]
     */
    if (Array.isArray(parsedSignature)) {
      return JSON.stringify(parsedSignature);
    }

    /**
     * Second request format:
     *
     * {
     *   "class": "sourmash_signature",
     *   ...
     * }
     *
     * Wrap it so it matches the first request format.
     */
    return JSON.stringify([parsedSignature]);
  } catch {
    /**
     * If this is not valid JSON, send it unchanged.
     * This prevents us from breaking unexpected input.
     */
    return signature;
  }
};

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
    const normalisedSignature = normaliseSourmashSignature(signature);

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
    shouldSendRequest ? `${config.api}genomes-search/${endpoint}` : null,
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
