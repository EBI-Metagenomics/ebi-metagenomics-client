import axios from 'utils/axios';
import { useToken } from 'hooks/useToken';
import { useContext } from 'react';
import UserContext from 'pages/Login/UserContext';

const useRefreshToken = () => {
  // const [token, setToken] = useToken();
  const { token } = useContext(UserContext);
  const refreshToken = async () => {
    alert('method called');
    const response = await axios.post(
      '/utils/token/verify',
      {
        token,
      },
      {
        withCredentials: true,
      }
    );
    debugger;
    alert('token being refreshed');
    console.log('refresh', response.data.data.token);
    // const { token } = response.data;
    // @ts-ignore
    setToken((prev) => {
      console.log('refresh', prev);
      console.log('refresh', response.data.data.token);
      return { ...prev, token: prev };
    });
    return response.data.data.token;
  };

  return refreshToken;
};

export default useRefreshToken;
