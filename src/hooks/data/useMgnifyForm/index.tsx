import { useContext } from 'react';
import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyForm: () => HTMLDataResponse = () => {
  const { config } = useContext(UserContext);
  const data = useData(
    `${config.api.replace('v1/', '')}http-auth/login_form`,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyForm;
