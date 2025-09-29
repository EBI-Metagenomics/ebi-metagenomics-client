import protectedAxios from 'utils/protectedAxios';
import useAuthToken from 'hooks/authentication/useAuthToken';
import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  const { setDetails } = useContext(UserContext);
  return async () => {
    try {
      await protectedAxios.post('/auth/verify', {
        token: authToken,
      });
      setAuthToken(authToken);
      // is 200 if valid
    } catch (error) {
      setAuthToken(null);
      setDetails(null);
    }
  };
};

export default useAuthTokenVerifier;
