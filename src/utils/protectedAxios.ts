import axios from 'axios';
import config from 'utils/config';

const BASE_URL = config.api;

const protectedAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});
protectedAxios.interceptors.request.use((conf) => {
  const token = localStorage.getItem('token');
  if (token && conf.url.startsWith(BASE_URL)) {
    // eslint-disable-next-line no-param-reassign
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});

export default protectedAxios;
