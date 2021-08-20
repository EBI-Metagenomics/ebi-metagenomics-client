import { useContext, useState, useEffect } from 'react';
import {
  useMgnifyForm,
  useMgnifyLogin,
  useMgnifyLogout,
  ErrorFromFetch,
} from 'hooks/useMGnifyData';
import UserContext from 'pages/Login/UserContext';

type AuthenticationFunctions = {
  login: (username: string, password: string) => void;
  logout: () => void;
  loginError: string;
  loading: boolean;
  error: ErrorFromFetch;
};
const useAuthentication = (): AuthenticationFunctions => {
  const { data, loading, error } = useMgnifyForm();
  const [loginError, setLoginError] = useState('');
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    username: null,
    password: null,
    csrfmiddlewaretoken: null,
  });
  const {
    data: dataLogin,
    loading: loadingLogin,
    rawResponse: rawResponseLogin,
  } = useMgnifyLogin(form.username, form.password, form.csrfmiddlewaretoken);

  useEffect(() => {
    if (!loadingLogin) {
      if (rawResponseLogin?.type === 'opaqueredirect') {
        setUser({ username: form.username, isAuthenticated: true });
        setLoginError('');
      } else if (dataLogin) {
        setLoginError(
          (dataLogin.querySelector('.text-error') as HTMLElement)?.innerText ||
            ''
        );
      }
    }
  }, [dataLogin, loadingLogin, form.username, rawResponseLogin?.type, setUser]);

  const [shouldLogout, setShouldLogout] = useState(false);
  const { loading: loadingLogout, rawResponse } = useMgnifyLogout(shouldLogout);
  useEffect(() => {
    setShouldLogout(false);
  }, [rawResponse]);

  const login = (username: string, password: string): void => {
    const csrfmiddlewaretoken = (
      data.querySelector(
        'input[name="csrfmiddlewaretoken"]'
      ) as HTMLInputElement
    ).value;
    setLoginError('');
    setForm({
      username,
      password,
      csrfmiddlewaretoken,
    });
  };

  const logout = (): void => {
    setShouldLogout(true);
    setUser({ username: null, isAuthenticated: false });
  };

  return {
    login,
    logout,
    loginError,
    loading: loading || loadingLogin || loadingLogout,
    error,
  };
};

export default useAuthentication;
