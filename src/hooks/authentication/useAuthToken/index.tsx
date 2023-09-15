import { useContext, useState } from 'react';
import UserContext from 'pages/Login/UserContext';

type AuthToken = string | null;
const getUserDetailsFromToken = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

const useAuthToken = (): [AuthToken, (newToken: AuthToken) => void] => {
  const [authToken, setAuthTokenInternally] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const { setUser } = useContext(UserContext);

  const setAuthToken = (newToken: AuthToken) => {
    if (!newToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setUser({
        username: '',
        token: '',
        isAuthenticated: false,
      });
      return;
    }
    localStorage.setItem('token', newToken as string);
    setAuthTokenInternally(newToken);
    const userDetails = getUserDetailsFromToken(newToken as string);
    localStorage.setItem('username', userDetails.username);
    setUser({
      username: userDetails.username,
      token: newToken,
      isAuthenticated: true,
    });
  };

  return [authToken, setAuthToken];
};

export default useAuthToken;
