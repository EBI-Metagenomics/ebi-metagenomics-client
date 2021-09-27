import { useContext } from 'react';
import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyLogout: (shouldLogout: boolean) => HTMLDataResponse = (
  shouldLogout
) => {
  const { config } = useContext(UserContext);
  const data = useData(
    shouldLogout ? `${config.api.replace('v1/', '')}http-auth/logout` : null,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyLogout;
