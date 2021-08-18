import React, { useContext } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

import UserContext from 'pages/Login/UserContext';
import { useMgnifyForm } from 'hooks/useMGnifyData';

const Login: React.FC = () => {
  const { data, loading, error } = useMgnifyForm();
  const { username, isAuthenticated, setUser } = useContext(UserContext);
  if (isAuthenticated) {
    return (
      <div className="vf-stack vf-stack--400">
        <div>
          You are already logged in as <b>{username}</b>
        </div>
        <button
          type="button"
          className="vf-button"
          onClick={() => setUser({ username: null, isAuthenticated: false })}
        >
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
  // is missing the csrftoken cookie
  return (
    <div className="vf-form vf-stack vf-stack--400">
      <input
        type="hidden"
        name="csrfmiddlewaretoken"
        value={csrfmiddlewaretoken}
      />

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
          required
        />
      </div>
      <div className="form-actions-no-box">
        <button
          type="button"
          name="submit"
          className="vf-button"
          id="submit-id-submit"
          onClick={() =>
            setUser({ username: 'tavocho', isAuthenticated: true })
          }
        >
          Log in
        </button>
      </div>
      <div className="form-forgotten">
        <a href="https://www.ebi.ac.uk/ena/submit/sra/#reset-password">
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

export default Login;
