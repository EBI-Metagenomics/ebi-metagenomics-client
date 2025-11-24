import { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ErrorFromFetch, ErrorTypes } from 'hooks/data/useData';
import useProtectedApiCall from 'hooks/useProtectedApiCall';
import UserContext from 'pages/Login/UserContext';
import paginatedDownloader from 'utils/paginatedDownloader';
import { isNil } from 'lodash-es';

interface FetchDataOptions<T> {
  url: string | null | undefined;
  transformResponse?: (data: T) => T;
  requireAuth?: boolean;
  includeAuthIfPresent?: boolean;
  pageParameter?: string;
}

const useApiData = <T,>({
  url,
  transformResponse,
  requireAuth = false,
  includeAuthIfPresent = true,
  pageParameter = undefined,
}: FetchDataOptions<T>) => {
  const { config } = useContext(UserContext);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ErrorFromFetch | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(true);
  const protectedAxios = useProtectedApiCall();
  const { isAuthenticated } = useContext(UserContext);
  const axiosInstance =
    requireAuth || (includeAuthIfPresent && isAuthenticated)
      ? protectedAxios
      : axios;

  useEffect(() => {
    const abortController = new AbortController(); // if component unmounts, abort the request. prevents some double fetches.

    const fetchData = async () => {
      if (!url) {
        setError({
          type: ErrorTypes.NullURL,
          error: new AxiosError('URL is null', 'NullURL'),
        });
        setLoading(false);
        return;
      }

      try {
        setStale(true);
        const response = await axiosInstance.get<T>(url, {
          signal: abortController.signal,
        });
        const processedData = transformResponse
          ? transformResponse(response.data)
          : response.data;
        setData(processedData);
        setError(null);
      } catch (err) {
        const axiosError = err as AxiosError;
        // Ignore abort errors
        if (
          axiosError.name === 'CanceledError' ||
          abortController.signal.aborted
        ) {
          return;
        }
        const errorFromFetch: ErrorFromFetch = {
          status: axiosError.response?.status,
          type: ErrorTypes.FetchError,
          error: axiosError,
        };
        setError(errorFromFetch);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          setStale(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url, transformResponse, axiosInstance]);
  const download = () =>
    isNil(url)
      ? async () => {}
      : paginatedDownloader(
          url,
          pageParameter,
          config.whenDownloadingListsFromApi?.maxPages || Infinity,
          config.whenDownloadingListsFromApi?.cadenceMs || 50,
          axiosInstance
        );

  return { data, error, loading, stale, url, download };
};

export default useApiData;
