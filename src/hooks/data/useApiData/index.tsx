import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ErrorFromFetch, ErrorTypes } from 'hooks/data/useData';

interface FetchDataOptions<T> {
  url: string | null;
  transformResponse?: (data: T) => T;
}

const useApiData = <T,>({ url, transformResponse }: FetchDataOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ErrorFromFetch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!url) {
        setError({
          type: ErrorTypes.NullURL,
          error: {
            message: 'URL is null',
            request: {
              responseURL: '',
            },
          },
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<T>(url);
        const processedData = transformResponse
          ? transformResponse(response.data)
          : response.data;
        setData(processedData);
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
  }, [url, transformResponse]);

  return { data, error, loading, url };
};

export default useApiData;
