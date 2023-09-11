import { axiosPrivate } from 'utils/axios';
import { useContext, useEffect } from 'react';
import useRefreshToken from 'hooks/useRefreshToken';
import UserContext from 'pages/Login/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
// import config from 'utils/config';

const useAxiosPrivate = () => {
  const refreshToken = useRefreshToken();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const { token } = useToken();
  const { token } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('here is config', config);
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const previousRequest = error.config;
        if (
          (error.response.status === 401 || error.response.status === 400) &&
          !previousRequest.sent
        ) {
          previousRequest.sent = true;
          navigate('/login', { state: { from: location }, replace: true });
          // navigate('/login?from=private-request');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
    // }, [token, refreshToken]);
  }, [token, refreshToken]);

  return axiosPrivate;
};

export default useAxiosPrivate;
