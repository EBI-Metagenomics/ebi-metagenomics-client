import { useState, useEffect } from 'react';
import config from 'config.json';

type KeyValue = {
  [key: string]: string | number;
};

const useData: (url: string) => null | KeyValue = (url) => {
  const [data, setData] = useState(null);

  async function fetchData(): Promise<void> {
    const response = await fetch(url);
    const json = await response.json();
    setData(json);
  }

  useEffect(() => {
    fetchData();
  }, [url]);
  return data;
};

export const useEBISearchData: (
  endpoint: string,
  parameters: KeyValue
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
  return data;
};

export default useData;
