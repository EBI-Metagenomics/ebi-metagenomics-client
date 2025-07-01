import axios from 'axios';
import config from 'utils/config';

const BASE_URL = config.api_v2;

const protectedAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
protectedAxios.interceptors.request.use((conf) => {
  const token = localStorage.getItem('mgnify.v2.token');
  if (token && (conf.url.startsWith(BASE_URL) || conf.url.startsWith('/'))) {
    // eslint-disable-next-line no-param-reassign
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});

export default protectedAxios;
