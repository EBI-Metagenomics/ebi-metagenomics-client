import { useState, useEffect, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { ErrorFromFetch, ErrorTypes } from 'hooks/data/useData';
import useProtectedApiCall from 'hooks/useProtectedApiCall';
import UserContext from 'pages/Login/UserContext';
import paginatedDownloader from 'utils/paginatedDownloader';

interface FetchDataOptions<T> {
  url: string | null;
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
        setStale(true);
        const response = await axiosInstance.get<T>(url);
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
        setStale(false);
      }
    };

    fetchData();
  }, [url, transformResponse, axiosInstance]);
  const download = () =>
    paginatedDownloader(
      url,
      pageParameter,
      config.whenDownloadingListsFromApi.maxPages,
      config.whenDownloadingListsFromApi.cadenceMs,
      axiosInstance
    );

  return { data, error, loading, stale, url, download };
};

export default useApiData;
