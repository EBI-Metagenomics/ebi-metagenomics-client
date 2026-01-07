import { useCallback, useContext, useState } from 'react';
import UserContext from 'pages/Login/UserContext';
import { jwtDecode } from 'jwt-decode';

type AuthToken = string | null;
interface TokenContent {
  username: string;
  iat: number;
  exp: number;
  token_type: string;
}

const useAuthToken = (): [AuthToken, (newToken: AuthToken) => void] => {
  const [authToken, setAuthTokenInternally] = useState<string | null>(() => {
    return localStorage.getItem('mgnify.v2.token');
  });
  const { setUser, setDetails } = useContext(UserContext);

  const setAuthToken = useCallback(
    (newToken: AuthToken) => {
      if (!newToken) {
        localStorage.removeItem('mgnify.v2.token');
        localStorage.removeItem('mgnify.v2.username');
        setUser({
          username: '',
          token: '',
          isAuthenticated: false,
        });
        setDetails(null);
        return;
      }
      localStorage.setItem('mgnify.v2.token', newToken as string);
      setAuthTokenInternally(newToken);
      const userDetailsFromToken = jwtDecode(
        newToken as string
      ) as TokenContent;
      localStorage.setItem('mgnify.v2.username', userDetailsFromToken.username);
      setUser({
        username: userDetailsFromToken.username,
        token: newToken,
        isAuthenticated: true,
      });
    },
    [setUser, setDetails]
  );

  return [authToken, setAuthToken];
};

export default useAuthToken;
