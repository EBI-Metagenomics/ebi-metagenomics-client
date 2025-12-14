import protectedAxios from '@/utils/protectedAxios';
import useAuthToken from '@/hooks/authentication/useAuthToken';
import UserContext from 'pages/Login/UserContext';
import { useCallback, useContext } from 'react';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  const { setDetails } = useContext(UserContext);

  // Memoize to avoid changing identity on every render, which was
  // retriggering effects and causing repeated API calls.

  return useCallback(async () => {
    // If there is no token, nothing to verify.
    if (!authToken) return;
    try {
      const response = await protectedAxios.post('/@/utils/token/verify', {
        token: authToken,
      });
      const accessToken = response?.data?.data?.token;
      // Avoid unnecessary state updates that can trigger re-renders.
      if (accessToken && accessToken !== authToken) {
        setAuthToken(accessToken);
      }
    } catch (error) {
      // On failure, clear token and user details.
      setAuthToken(null);
      setDetails(null);
    }
  }, [authToken, setAuthToken, setDetails]);
};

export default useAuthTokenVerifier;
