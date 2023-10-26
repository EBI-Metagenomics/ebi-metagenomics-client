import axios from 'axios';

const BASE_URL = 'https://wwwint.ebi.ac.uk/metagenomics/api/v1';

const protectedAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
protectedAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.url.startsWith(BASE_URL)) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default protectedAxios;
