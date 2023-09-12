import { protectedAxios } from 'utils/axios';
import { useEffect } from 'react';
import useAuthTokenVerifier from 'hooks/authentication/useAuthTokenVerifier';
import { useNavigate, useLocation } from 'react-router-dom';

const useProtectedApiCall = () => {
  const verifyAuthToken = useAuthTokenVerifier();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('protected', location);
    const requestInterceptor = protectedAxios.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = protectedAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const previousRequest = error.config;
        if (error.response.status === 401 && !previousRequest.sent) {
          previousRequest.sent = true;
          navigate('/login', { state: { from: location }, replace: true });
        }
        return Promise.reject(error);
      }
    );
    return () => {
      protectedAxios.interceptors.request.eject(requestInterceptor);
      protectedAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, verifyAuthToken]);

  return protectedAxios;
};

export default useProtectedApiCall;
