import { useContext, useDebugValue } from 'react';
import UserContext from 'pages/Login/UserContext';

const useAuth = () => {
  const { token } = useContext(UserContext);
  // useDebugValue(auth, (auth) => (auth?.user ? 'Logged In' : 'Logged Out'));
  return useContext(UserContext);
};

export default useAuth;
