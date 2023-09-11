import { useContext, useState } from 'react';
import UserContext from 'pages/Login/UserContext';

export const useToken = () => {
  // const [token, setTokenInternal] = useState<string | null>(() => {
  //   return localStorage.getItem('token');
  // });
  const [token, setTokenInternal] = useState('');
  const { setUser } = useContext(UserContext);

  const setToken = (newToken: string | null) => {
    // alert('setToken');
    // localStorage.setItem('token', newToken as string);
    setTokenInternal(newToken);
    setUser({ username: 'ffww', token: newToken, isAuthenticated: true });
  };

  return [token, setToken];
};
