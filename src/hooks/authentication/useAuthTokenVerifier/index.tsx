import axios from 'utils/axios';
import useAuthToken from 'hooks/authentication/useAuthToken';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  return async () => {
    try {
      const response = await axios.post('/utils/token/verify', {
        token: authToken,
      });
      const accessToken = response.data.data.token as string;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setAuthToken(accessToken);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  };
};

export default useAuthTokenVerifier;
