import { useState, useEffect } from 'react';

export enum ResponseFormat {
  JSON,
  HTML,
  TXT,
  TSV,
}

export enum ErrorTypes {
  FetchError,
  NotOK,
  JSONError,
  TSVError,
  NullURL,
  OtherError,
}

export type KeyValue = {
  [key: string]: string | number | Record<string, unknown> | [];
};

type RelationshipDatum = {
  id: string;
  type: string;
};
export type MGnifyDatum = {
  attributes: KeyValue;
  id: string;
  links: KeyValue;
  type: string;
  relationships: {
    biomes?: {
      data?: Array<RelationshipDatum>;
    };
    biome?: {
      data?: RelationshipDatum;
    };
    studies?: {
      data: Array<KeyValue>;
    };
    study?: {
      data: RelationshipDatum;
    };
    samples?: {
      data: Array<KeyValue>;
    };
    sample?: {
      data: RelationshipDatum;
    };
    assemblies?: {
      data: Array<KeyValue>;
    };
    assembly?: {
      data: RelationshipDatum;
    };
    runs?: {
      data: Array<KeyValue>;
    };
    run?: {
      data: RelationshipDatum;
    };
    [key: string]: unknown;
  };
};

export interface MGnifyResponse {
  data: Array<MGnifyDatum> | MGnifyDatum | Record<string, unknown>[];
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
  included?: Array<KeyValue>;
}
export interface MGnifyResponseList extends MGnifyResponse {
  data: Array<MGnifyDatum>;
}

export interface MGnifyResponseObj extends MGnifyResponse {
  data: MGnifyDatum;
}

export type BlogResponse = {
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

export type TSVResponse = Array<string>[];

export type FASTAResponse = Array<string>[];

export interface DataResponse {
  data:
    | null
    | KeyValue
    | MGnifyResponse
    | BlogResponse
    | HTMLHtmlElement
    | TSVResponse
    | FASTAResponse;
  error: ErrorFromFetch | null;
  loading: boolean;
  isStale: boolean;
  rawResponse?: Response;
}

export interface HTMLDataResponse extends DataResponse {
  data: HTMLHtmlElement;
}

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
    case ResponseFormat.TSV:
      try {
        const text = await response.text();
        data = text
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t'));
      } catch (error) {
        updateState({
          error: {
            error,
            type: ErrorTypes.TSVError,
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

export default useData;