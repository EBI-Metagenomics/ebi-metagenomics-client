import { KeyValue } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import { useState, useEffect, useContext } from 'react';
import axios, { AxiosError } from 'axios';

interface Download {
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
}

export interface AnalysesDetail {
  study_accession: string;
  accession: string;
  downloads: Download[];
  run_accession: string;
  sample_accession: string;
  assembly_accession: string | null;
  experiment_type: string;
  instrument_model: string | null;
  instrument_platform: string | null;
  pipeline_version: string;
}

export enum ErrorTypes {
  FetchError,
  NotOK,
  JSONError,
  TSVError,
  NullURL,
  OtherError,
}

export type ErrorFromFetch = {
  status?: number;
  response?: Promise<Response>;
  type: ErrorTypes;
  error?: unknown;
};

const useAnalysesDetail = (id: string, parameters: KeyValue = {}) => {
  const [data, setData] = useState<AnalysesDetail | null>(null);
  const [error, setError] = useState<ErrorFromFetch | null>(null);
  const [loading, setLoading] = useState(true);
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}analyses/${id}${
    queryString ? `?${queryString}` : ''
  }`;

  useEffect(() => {
    const fetchData = async () => {
      if (!url) {
        setError({
          type: ErrorTypes.NullURL,
          error: new Error('URL is null'),
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<AnalysesDetail>(url);
        setData(response.data);
        setError(null);
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorFromFetch: ErrorFromFetch = {
          status: axiosError.response?.status,
          type: ErrorTypes.FetchError,
          error: err,
        };
        setError(errorFromFetch);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};

export default useAnalysesDetail;
