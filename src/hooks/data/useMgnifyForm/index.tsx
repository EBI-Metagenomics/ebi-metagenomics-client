import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import config from 'config.json';

const useMgnifyForm: () => HTMLDataResponse = () => {
  const data = useData(
    `${config.api.replace('v1/', '')}http-auth/login_form`,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyForm;
