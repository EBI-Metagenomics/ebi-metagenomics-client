import { useState, useEffect, useContext } from 'react';
import { useToken } from 'hooks/useToken';
import UserContext from 'pages/Login/UserContext';

// eslint-disable-next-line import/prefer-default-export
export const useUser = () => {
  const [token] = useToken();

  const getPayloadFromToken = (token2: string) => {
    const encodedPayload = token2.split('.')[1];
    const firstPart = encodedPayload.slice(0, encodedPayload.length / 2);
    const lastPart = encodedPayload.slice(encodedPayload.length / 2);
    console.log('firstPart', firstPart);
    console.log('lastPart', lastPart);
    return JSON.parse(atob(encodedPayload));
  };

  const [user, setUserInternal] = useState(() => {
    if (token) {
      return getPayloadFromToken(token as string);
    }
    return null;
  });

  const { setUser } = useContext(UserContext);

  useEffect(() => {
    // alert('useEffect');
    if (token) {
      setUserInternal(getPayloadFromToken(token as string));
      // setUser({ username: user.username, isAuthenticated: true });

      // console.log('user from here', user);
    } else {
      setUserInternal(null);
    }
  }, [token, setUser]);

  return user;
};
