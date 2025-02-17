import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useAuthTokenVerifier from '@/hooks/authentication/useAuthTokenVerifier';

const PersistLogin = () => {
  const [, setIsLoading] = useState(true);
  const verifyAuthToken = useAuthTokenVerifier();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await verifyAuthToken();
        setIsLoading(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, []);

  return <Outlet />;

  // return isLoading ? <p>Loading...</p> : <Outlet />;
};
export default PersistLogin;
