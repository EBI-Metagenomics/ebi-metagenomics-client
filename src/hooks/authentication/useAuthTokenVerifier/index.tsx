import axios from 'utils/protectedAxios';
import useAuthToken from 'hooks/authentication/useAuthToken';
import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  const { setDetails } = useContext(UserContext);
  return async () => {
    try {
      const response = await axios.post('/utils/token/verify', {
        token: authToken,
      });
      const accessToken = response.data.data.token;
      setAuthToken(accessToken);
    } catch (error) {
      setAuthToken(null);
      setDetails(null);
    }
  };
};

export default useAuthTokenVerifier;
