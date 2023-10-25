import axios from 'axios';

const BASE_URL = 'http://localhost:8000/v1';
// const BASE_URL = 'https://wwwint.ebi.ac.uk/metagenomics/api/v1';
export default axios.create({
  baseURL: BASE_URL,
});
export const protectedAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const makeDynamicAxiosCall = (
  url: string,
  method: string,
  data: any
) => {
  return axios({
    method,
    url,
    data,
  });
};
