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
async function fetchData(
  url: string,
  callback: (unknown) => void
): Promise<void> {
  const response = await fetch(url);
  const json = await response.json();
  callback(json);
}

const useData: (url: string) => null | KeyValue | MGnifyResponse = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(url, setData);
  }, [url]);
  return data;
};

export const useEBISearchData: (
  endpoint: string,
  parameters?: KeyValue
) => null | KeyValue = (endpoint, parameters = {}) => {
  const defaultParameters = {
    format: 'json',
    start: 0,
  };
  const allParemeters = { ...defaultParameters, ...parameters };
  const url = `${config.ebisearch}${endpoint}?${Object.entries(allParemeters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  const data = useData(url);
  return data as null | KeyValue;
};

export const useMGnifyData: (
  endpoint: string,
  parameters?: KeyValue
) => null | MGnifyResponse = (endpoint, parameters = {}) => {
  const defaultParameters = {};
  const allParemeters = { ...defaultParameters, ...parameters };
  let url = `${config.api}${endpoint}`;
  if (Object.keys(allParemeters).length > 0)
    url += `?${Object.entries(allParemeters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  const data = useData(url);
  return data as MGnifyResponse | null;
};

export default useData;
