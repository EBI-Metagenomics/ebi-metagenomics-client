import { useState, useEffect } from 'react';
import protectedAxios from 'utils/protectedAxios';
import { AxiosResponse } from 'axios';

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

export type Download = {
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
};

export interface V2Response {
  study_accession: string;
  accession: string;
  downloads: Download[];
}

export interface DataV2Response {
  data: V2Response | null;
  error: ErrorFromFetch | null;
  loading: boolean;
  isStale: boolean;
  rawResponse?: Response;
}

export type ErrorFromFetch = {
  status?: number;
  response?: Promise<Response>;
  type: ErrorTypes;
  error?: unknown;
};

// Prepare the response data based on the format specified
const prepareResponseDataBasedOnFormatV2 = (
  response: AxiosResponse,
  format: ResponseFormat,
  updateState: (DataV2Response) => void
): V2Response | null => {
  let data = null;
  try {
    switch (format) {
      case ResponseFormat.HTML:
        const html = response.data;
        const el = document.createElement('html');
        el.innerHTML = html;
        data = el;
        break;
      case ResponseFormat.TSV:
        const text = response.data;
        data = text
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t'));
        break;
      default:
        data = response.data; // Assuming the response already fits the V2Response structure
        break;
    }
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
  }
  return data;
};

async function fetchDataV2(
  url: string,
  updateState: (DataV2Response) => void,
  format: ResponseFormat = ResponseFormat.JSON,
  fetchOptions: RequestInit = {}
): Promise<void> {
  let response = null;

  try {
    if (fetchOptions.method === 'POST') {
      response = await protectedAxios.post(url, fetchOptions.body, {
        headers:
          fetchOptions.headers ||
          ({
            'Content-Type': 'application/json',
          } as object),
      });
    } else {
      response = await protectedAxios.get(url);
    }
    const data = prepareResponseDataBasedOnFormatV2(response, format, updateState);
    updateState({
      data,
      loading: false,
      error: null,
      isStale: false,
      rawResponse: response,
    });
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
  }
}

const EmptyResponseV2: DataV2Response = {
  data: null,
  loading: false,
  error: {
    type: ErrorTypes.NullURL,
    error: 'The queried URL is null',
  },
  isStale: false,
  rawResponse: null,
};

const NewRequestV2: DataV2Response = {
  data: null,
  loading: true,
  error: null,
  isStale: false,
  rawResponse: null,
};

const useDataV2: (
  url: string,
  format?: ResponseFormat,
  fetchOptions?: RequestInit
) => DataV2Response = (url, format = ResponseFormat.JSON, fetchOptions = {}) => {
  const [state, setFullState] = useState(NewRequestV2);
  let isActive = true;

  const setPartialState = (updatedValues: Partial<DataV2Response>): void => {
    if (isActive)
      setFullState((prevState) => ({
        ...prevState,
        ...updatedValues,
      }));
  };

  useEffect(() => {
    if (url) {
      setPartialState({
        loading: true,
        isStale: true,
      });
      fetchDataV2(url, setPartialState, format, fetchOptions);
    } else {
      setFullState(EmptyResponseV2);
    }
    return () => {
      isActive = false;
    };
  }, [
    url,
    format,
    new URLSearchParams((fetchOptions?.body as string) || '').toString(),
  ]);

  return state;
};

export default useDataV2;
