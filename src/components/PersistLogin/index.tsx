import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useRefreshToken from 'hooks/useRefreshToken';
import { useToken } from 'hooks/useToken';

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const token = useToken();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        alert('verifyToken');
        await refresh();
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();

    // if (!token) {
    //   verifyToken();
    // } else {
    //   alert('no loading');
    //   setIsLoading(false);
    // }

    // !token ? verifyToken() : setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log('isLoading', isLoading);
    console.log('auth token', token);
  }, [isLoading]);

  return <Outlet />;

  // return isLoading ? <p>Loading...</p> : <Outlet />;
};
export default PersistLogin;
