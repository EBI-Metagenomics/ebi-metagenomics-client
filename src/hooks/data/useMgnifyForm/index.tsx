import { useContext } from 'react';
import useData, { DataResponse, ResponseFormat } from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyForm: () => DataResponse = () => {
  const { config } = useContext(UserContext);
  const data = useData(
    `${config.api.replace('v1/', '')}http-auth/login_form`,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data;
};

export default useMgnifyForm;
