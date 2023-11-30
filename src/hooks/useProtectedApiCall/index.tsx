import protectedAxios from 'utils/protectedAxios';
import { useEffect } from 'react';
import useAuthTokenVerifier from 'hooks/authentication/useAuthTokenVerifier';
import { useNavigate, useLocation } from 'react-router-dom';

const useProtectedApiCall = () => {
  const verifyAuthToken = useAuthTokenVerifier();
  const authToken = localStorage.getItem('mgnify.token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const requestInterceptor = protectedAxios.interceptors.request.use(
      (config) => {
        // TODO also check base URL here
        if (!config.headers.Authorization) {
          // eslint-disable-next-line no-param-reassign
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
          navigate('/login', { state: { from: location }, replace: true });
        }
        return Promise.reject(error);
      }
    );
    return () => {
      protectedAxios.interceptors.request.eject(requestInterceptor);
      protectedAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [authToken, verifyAuthToken, location, navigate]);

  return protectedAxios;
};

export default useProtectedApiCall;
