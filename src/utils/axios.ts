import axios from 'axios';
import { useContext } from 'react';
import UserContext from 'pages/Login/UserContext';

// const { config } = useContext(UserContext);

const BASE_URL = 'http://localhost:8000/v1';
export default axios.create({
  baseURL: BASE_URL,
});
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
