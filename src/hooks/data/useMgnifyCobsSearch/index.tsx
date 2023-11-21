import { useContext } from 'react';

import useData, {
  ErrorFromFetch,
  KeyValue,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

export interface CobsResponse {
  data: {
    data: {
      errors?: {
        [fieldName: string]: string;
      };
      results: [
        {
          cobs: KeyValue;
          mgnify: KeyValue;
        }
      ];
    };
  };
  error: ErrorFromFetch | null;
  loading: boolean;
}

const useMgnifyCobsSearch: (
  sequence: string,
  threshold: number,
  cataloguesFilter: string[]
) => CobsResponse = (sequence, threshold, cataloguesFilter) => {
  const { config } = useContext(UserContext);
  const formData = new FormData();
  formData.append('seq', sequence);
  formData.append('threshold', String(threshold));
  cataloguesFilter.forEach((catalogue) =>
    formData.append('catalogues_filter', catalogue)
  );

  const data = useData(
    sequence.length && String(threshold).length && cataloguesFilter.length
      ? `${config.api}genome-search`
      : null,
    ResponseFormat.JSON,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data as unknown as CobsResponse;
};

export default useMgnifyCobsSearch;
