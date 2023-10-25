import { useContext, useState } from 'react';
import UserContext from 'pages/Login/UserContext';
import axios from 'axios';

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
  const { setUser, setDetails } = useContext(UserContext);

  const getUserDetailsFromAccountApi = () => {
    axios
      .get('http://127.0.0.1:8000/v1/utils/myaccounts', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setDetails(response.data.data);
      });
  };

  const setAuthToken = (newToken: AuthToken) => {
    if (!newToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setUser({
        username: '',
        token: '',
        isAuthenticated: false,
      });
      setDetails(null);
      return;
    }
    localStorage.setItem('token', newToken as string);
    setAuthTokenInternally(newToken);
    const userDetailsFromToken = getUserDetailsFromToken(newToken as string);
    localStorage.setItem('username', userDetailsFromToken.username);
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
