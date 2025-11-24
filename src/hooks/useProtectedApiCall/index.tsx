import protectedAxios from '@/utils/protectedAxios';
import { useEffect } from 'react';
import useAuthTokenVerifier from '@/hooks/authentication/useAuthTokenVerifier';
import { useNavigate } from 'react-router-dom';

const useProtectedApiCall = () => {
  const verifyAuthToken = useAuthTokenVerifier();
  const authToken = localStorage.getItem('mgnify.v2.token');
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = protectedAxios.interceptors.request.use(
      (config) => {
        // TODO also check base URL here
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${authToken}`;
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
          navigate('/login', {
            state: { from: window.location },
            replace: true,
          });
        }
        return Promise.reject(error);
      }
    );
    return () => {
      protectedAxios.interceptors.request.eject(requestInterceptor);
      protectedAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [authToken, navigate, verifyAuthToken]);

  return protectedAxios;
};

export default useProtectedApiCall;
