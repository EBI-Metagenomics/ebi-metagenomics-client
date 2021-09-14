import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import config from 'config.json';

const useMgnifyLogin: (
  username: string,
  password: string,
  csrfmiddlewaretoken: string
) => HTMLDataResponse = (username, password, csrfmiddlewaretoken) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken);

  const data = useData(
    username ? `${config.api.replace('v1/', '')}http-auth/login/` : null,
    ResponseFormat.HTML,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfmiddlewaretoken,
      },
      credentials: 'include',
      body: formData,
      redirect: 'manual',
    }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyLogin;
