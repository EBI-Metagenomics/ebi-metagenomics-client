import axios from 'axios';
import config from '@/utils/config';

const BASE_URL = config.api_v2;

const protectedAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
protectedAxios.interceptors.request.use((conf) => {
  const token = localStorage.getItem('mgnify.v2.token');
  if (token && (conf.url?.startsWith(BASE_URL) || conf.url?.startsWith('/'))) {
    conf.headers.Authorization = `Bearer ${token}`;
  } else {
    conf.headers.Authorization = null;
  }
  return conf;
});

export const fetchWithFallback = (
  path: string,
  fallbacks: string[] = []
): Promise<any> => {
  const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
  const request = isAbsolute ? axios.get(path) : protectedAxios.get(path);

  return request.catch((err) => {
    // Check for 404 in various ways axios might report it
    const status = err.response?.status;
    const is404 = status === 404 || err.code === 'ERR_NETWORK' || !err.response;

    if ((is404 || status === 0) && fallbacks.length > 0) {
      const [next, ...remaining] = fallbacks;
      return fetchWithFallback(next, remaining);
    }
    throw err;
  });
};

export default protectedAxios;
