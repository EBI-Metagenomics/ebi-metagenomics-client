import { useContext, useState } from 'react';
import UserContext from 'pages/Login/UserContext';
import protectedAxios from '@/utils/protectedAxios';

type AuthToken = string | null;
const getUserDetailsFromToken = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

const useAuthToken = (): [AuthToken, (newToken: AuthToken) => void] => {
  const [authToken, setAuthTokenInternally] = useState<string | null>(() => {
    return localStorage.getItem('mgnify.token');
  });
  const { setUser, setDetails } = useContext(UserContext);

  const getUserDetailsFromAccountApi = () => {
    protectedAxios.get('/@/utils/myaccounts').then((response) => {
      setDetails(response.data.data);
    });
  };

  const setAuthToken = (newToken: AuthToken) => {
    if (!newToken) {
      localStorage.removeItem('mgnify.token');
      localStorage.removeItem('mgnify.username');
      setUser({
        username: '',
        token: '',
        isAuthenticated: false,
      });
      setDetails(null);
      return;
    }
    localStorage.setItem('mgnify.token', newToken as string);
    setAuthTokenInternally(newToken);
    const userDetailsFromToken = getUserDetailsFromToken(newToken as string);
    localStorage.setItem('mgnify.username', userDetailsFromToken.username);
    setUser({
      username: userDetailsFromToken.username,
      token: newToken,
      isAuthenticated: true,
    });
    getUserDetailsFromAccountApi();
  };

  return [authToken, setAuthToken];
};

export default useAuthToken;
