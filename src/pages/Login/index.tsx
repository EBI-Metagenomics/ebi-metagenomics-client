import React, { useContext, useState, useEffect, useRef } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

import UserContext from 'pages/Login/UserContext';
import {
  useMgnifyForm,
  useMgnifyLogin,
  useMgnifyLogout,
} from 'hooks/useMGnifyData';

const Login: React.FC = () => {
  const userRef = useRef(null);
  const passwordRef = useRef(null);
  const { data, loading, error } = useMgnifyForm();
  const [shouldLogout, setShouldLogout] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { rawResponse } = useMgnifyLogout(shouldLogout);
  useEffect(() => {
    setShouldLogout(false);
  }, [rawResponse]);
  const {
    username: loggedUsername,
    isAuthenticated,
    setUser,
  } = useContext(UserContext);
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
      if (dataLogin) {
        setLoginError(
          (dataLogin.querySelector('.text-error') as HTMLElement)?.innerText ||
            ''
        );
      } else if (rawResponseLogin?.type === 'opaqueredirect') {
        setUser({ username: form.username, isAuthenticated: true });
        setLoginError('');
      }
    }
  }, [dataLogin, loadingLogin, form.username, rawResponseLogin?.type, setUser]);

  const handleLogout = (): void => {
    setShouldLogout(true);
    setUser({ username: null, isAuthenticated: false });
  };
  if (isAuthenticated) {
    return (
      <div className="vf-stack vf-stack--400">
        <div>
          You are logged in as <b>{loggedUsername}</b>
        </div>
        <button type="button" className="vf-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  const csrfmiddlewaretoken = (
    data.querySelector('input[name="csrfmiddlewaretoken"]') as HTMLInputElement
  ).value;
  const handleSubmit = (): void => {
    setForm({
      username: userRef.current.value,
      password: passwordRef.current.value,
      csrfmiddlewaretoken,
    });
  };
  return (
    <div className="vf-form vf-stack vf-stack--400">
      <div className="vf-form__item">
        <label htmlFor="id_username" className="vf-form__label">
          Webin-ID:
        </label>
        <input
          type="text"
          name="username"
          maxLength={100}
          autoCapitalize="off"
          autoCorrect="off"
          id="id_username"
          className="vf-form__input"
          ref={userRef}
          required
        />
      </div>
      <div className="vf-form__item">
        <label htmlFor="id_password" className="vf-form__label">
          Password:
        </label>
        <input
          type="password"
          name="password"
          maxLength={100}
          autoCapitalize="off"
          autoCorrect="off"
          className="vf-form__input"
          id="id_password"
          ref={passwordRef}
          required
        />
      </div>
      <div className="form-actions-no-box">
        <button
          type="button"
          name="submit"
          className="vf-button"
          id="submit-id-submit"
          onClick={handleSubmit}
        >
          Log in
        </button>
      </div>
      {loadingLogin && <Loading />}
      {loginError && <div className="vf-box">{loginError}</div>}
      <div className="form-forgotten">
        <a href="https://www.ebi.ac.uk/ena/submit/sra/#reset-password">
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

export default Login;
