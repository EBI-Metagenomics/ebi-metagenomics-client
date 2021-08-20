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
  NullURL,
}

export enum ResponseFormat {
  JSON,
  HTML,
  TXT,
}
interface DataResponse {
  data: null | KeyValue | MGnifyResponse | BlogResponse | HTMLHtmlElement;
  error: ErrorFromFetch | null;
  loading: boolean;
  isStale: boolean;
  rawResponse?: Response;
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
interface HTMLDataResponse extends DataResponse {
  data: HTMLHtmlElement;
}

const EmptyResponse = {
  data: null,
  loading: false,
  error: {
    type: ErrorTypes.NullURL,
    error: 'The queried URL is null',
  },
  isStale: false,
  rawResponse: null,
};
const NewRequest = {
  data: null,
  loading: true,
  error: null,
  isStale: false,
  rawResponse: null,
};

async function fetchData(
  url: string,
  updateState: (DataResponse) => void,
  format: ResponseFormat = ResponseFormat.JSON,
  fetchOptions: RequestInit = {}
): Promise<void> {
  let response = null;
  let data = null;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    updateState({
      error: {
        error,
        type: ErrorTypes.FetchError,
      },
      loading: false,
      isStale: false,
      rawResponse: response,
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
      isStale: false,
      rawResponse: response,
    });
    return;
  }
  switch (format) {
    case ResponseFormat.JSON:
      try {
        data = await response.json();
      } catch (error) {
        updateState({
          error: {
            error,
            type: ErrorTypes.JSONError,
          },
          loading: false,
          isStale: false,
          rawResponse: response,
        });
        return;
      }
      break;
    case ResponseFormat.HTML:
      try {
        const html = await response.text();
        const el = document.createElement('html');
        el.innerHTML = html;
        data = el;
      } catch (error) {
        updateState({
          error: {
            error,
            type: ErrorTypes.JSONError,
          },
          loading: false,
          isStale: false,
          rawResponse: response,
        });
        return;
      }
      break;
    default:
      data = await response.text();
  }
  updateState({
    data,
    loading: false,
    error: null,
    isStale: false,
    rawResponse: response,
  });
}

const useData: (
  url: string,
  format?: ResponseFormat,
  fetchOptions?: RequestInit
) => DataResponse = (url, format = ResponseFormat.JSON, fetchOptions = {}) => {
  const [state, setFullState] = useState(NewRequest);
  // A flag to be able to clean up in case acomponent is unmount before the request is completed
  let isActive = true;
  const setPartialState = (updatedValues): void => {
    if (isActive)
      setFullState((prevState) => ({
        ...prevState,
        ...updatedValues,
      }));
  };
  useEffect(() => {
    // If the URL is null don't do the fetch and return the empty response
    if (url) {
      setPartialState({
        loading: true,
        isStale: true,
      });
      fetchData(url, setPartialState, format, fetchOptions);
    } else {
      setFullState(EmptyResponse);
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isActive = false;
    };
  }, [
    url,
    format,
    new URLSearchParams((fetchOptions?.body as string) || '').toString(),
  ]);
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
  const data = useData([null, undefined].includes(endpoint) ? null : url);
  return data as EBIDataResponse;
};

export const useMGnifyData: (
  endpoint: string,
  parameters?: KeyValue,
  fetchOptions?: RequestInit
) => MgnifyDataResponse = (endpoint, parameters = {}, fetchOptions = {}) => {
  const defaultParameters = {};
  const allParemeters = { ...defaultParameters, ...parameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParemeters).length > 0)
    url += `?${Object.entries(allParemeters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  const data = useData(
    [null, undefined].includes(endpoint) ? null : url,
    ResponseFormat.JSON,
    fetchOptions
  );
  return data as MgnifyDataResponse;
};

export const useBlogData: (resource: string) => BlogDataResponse = (
  resource
) => {
  const data = useData(
    [null, undefined].includes(resource) ? null : `${config.blog}${resource}`
  );
  return data as BlogDataResponse;
};

export const useMgnifyForm: () => HTMLDataResponse = () => {
  const data = useData(
    `${config.api.replace('v1/', '')}http-auth/login_form`,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};
export const useMgnifyLogout: (shouldLogout: boolean) => HTMLDataResponse = (
  shouldLogout
) => {
  const data = useData(
    shouldLogout ? `${config.api.replace('v1/', '')}http-auth/logout` : null,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};
export const useMgnifyLogin: (
  username: string,
  password: string,
  csrfmiddlewaretoken: string
) => HTMLDataResponse = (username, password, csrfmiddlewaretoken) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken);

  const data = useData(
    username ? `${config.api.replace('v1/', '')}http-auth/login/` : null,
    ResponseFormat.HTML,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfmiddlewaretoken,
      },
      credentials: 'include',
      body: formData,
      redirect: 'manual',
    }
  );
  return data as HTMLDataResponse;
};

export default useData;
