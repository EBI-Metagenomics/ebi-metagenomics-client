import { useContext } from 'react';
import useData, { HTMLDataResponse, ResponseFormat } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyLogin: (
  username: string,
  password: string,
  csrfmiddlewaretoken: string,
  next: string
) => HTMLDataResponse = (username, password, csrfmiddlewaretoken, next) => {
  const { config } = useContext(UserContext);
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken);
  formData.append('next', next);

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
