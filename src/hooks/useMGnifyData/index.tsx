import { useState, useEffect } from 'react';
import config from 'config.json';

type KeyValue = {
  [key: string]: string | number | Record<string, unknown> | [];
};
type MGnifyResponse = {
  data: Array<{
    attributes: KeyValue;
    id: string;
    links: KeyValue;
    type: string;
    relationships: {
      biomes?: {
        data?: Array<{
          id: string;
        }>;
      };
      [key: string]: unknown;
    };
  }>;
  links: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
  meta: {
    pagination: {
      count: number;
      page: number;
      pages: number;
    };
  };
};

type BlogResponse = {
  [category: string]: {
    title: string;
    url: string;
    image: string;
    excerpt: string;
    category: string;
    published: string;
    emg: {
      text: string;
      url: string;
    };
  };
};

export type ErrorFromFetch = {
  status?: number;
  response?: Promise<Response>;
  type: ErrorTypes;
  error?: unknown;
};
export enum ErrorTypes {
  FetchError,
  NotOK,
  JSONError,
}

interface DataResponse {
  data: null | KeyValue | MGnifyResponse | BlogResponse;
  error: ErrorFromFetch | null;
  loading: boolean;
}

interface EBIDataResponse extends DataResponse {
  data: KeyValue;
}
interface MgnifyDataResponse extends DataResponse {
  data: MGnifyResponse;
}
interface BlogDataResponse extends DataResponse {
  data: BlogResponse;
}

async function fetchData(
  url: string,
  updateState: (DataResponse) => void
): Promise<void> {
  let response = null;
  let json = null;
  try {
    response = await fetch(url);
  } catch (error) {
    updateState({
      error: {
        error,
        type: ErrorTypes.FetchError,
      },
      loading: false,
    });
    return;
  }
  if (!response.ok) {
    updateState({
      error: {
        status: response.status,
        response,
        type: ErrorTypes.NotOK,
      },
      loading: false,
    });
    return;
  }
  try {
    json = await response.json();
  } catch (error) {
    updateState({
      error: {
        error,
        type: ErrorTypes.JSONError,
      },
      loading: false,
    });
    return;
  }

  updateState({ data: json, loading: false });
}

const useData: (url: string) => DataResponse = (url) => {
  const [state, setFullState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const setPartialState = (updatedValues): void => {
    setFullState((prevState) => ({
      ...prevState,
      ...updatedValues,
    }));
  };
  useEffect(() => {
    fetchData(url, setPartialState);
  }, [url]);
  return state;
};

export const useEBISearchData: (
  endpoint: string,
  parameters?: KeyValue
) => EBIDataResponse = (endpoint, parameters = {}) => {
  const defaultParameters = {
    format: 'json',
    start: 0,
  };
  const allParemeters = { ...defaultParameters, ...parameters };
  const url = `${config.ebisearch}${endpoint}?${Object.entries(allParemeters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  const data = useData(url);
  return data as EBIDataResponse;
};

export const useMGnifyData: (
  endpoint: string,
  parameters?: KeyValue
) => MgnifyDataResponse = (endpoint, parameters = {}) => {
  const defaultParameters = {};
  const allParemeters = { ...defaultParameters, ...parameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParemeters).length > 0)
    url += `?${Object.entries(allParemeters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  const data = useData(url);
  return data as MgnifyDataResponse;
};

export const useBlogData: (resource: string) => BlogDataResponse = (
  resource
) => {
  const data = useData(`${config.blog}${resource}`);
  return data as BlogDataResponse;
};

export default useData;
