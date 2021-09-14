import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import config from 'config.json';

const useMgnifyLogout: (shouldLogout: boolean) => HTMLDataResponse = (
  shouldLogout
) => {
  const data = useData(
    shouldLogout ? `${config.api.replace('v1/', '')}http-auth/logout` : null,
    ResponseFormat.HTML,
    { credentials: 'include' }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyLogout;
