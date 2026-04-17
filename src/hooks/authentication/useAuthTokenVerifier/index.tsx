import protectedAxios from '@/utils/protectedAxios';
import useAuthToken from '@/hooks/authentication/useAuthToken';
import UserContext from 'pages/Login/UserContext';
import { useCallback, useContext } from 'react';

const useAuthTokenVerifier = () => {
  const [authToken, setAuthToken] = useAuthToken();
  const { isAuthenticated, setDetails } = useContext(UserContext);

  // Memoize to avoid changing identity on every render, which was
  // retriggering effects and causing repeated API calls.

  return useCallback(async () => {
    // If there is no token or user has logged out, nothing to verify.
    if (!authToken || !isAuthenticated) return;
    try {
      const response = await protectedAxios.post('/auth/sliding/refresh', {
        token: authToken,
      });
      const accessToken = response?.data?.token;
      // Avoid unnecessary state updates that can trigger re-renders.
      if (accessToken && accessToken !== authToken) {
        setAuthToken(accessToken);
      }
    } catch (error) {
      // On failure, don't clear token and user details to persist login on reload.
      console.error(error);
      // setAuthToken(null);
      // setDetails(null);
    }
  }, [authToken, setAuthToken, setDetails, isAuthenticated]);
};

export default useAuthTokenVerifier;
