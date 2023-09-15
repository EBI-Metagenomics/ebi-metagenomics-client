import axios from 'utils/axios';
import useAuthToken from 'hooks/authentication/useAuthToken';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  return async () => {
    try {
      const response = await axios.post('/utils/token/verify', {
        token: authToken,
      });
      const accessToken = response.data.data.token;
      setAuthToken(accessToken);
    } catch (error) {
      setAuthToken(null);
    }
  };
};

export default useAuthTokenVerifier;
