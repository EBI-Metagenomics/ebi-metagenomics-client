import React, { useContext, useRef } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import OutterCard from 'components/UI/OutterCard';

import UserContext from 'pages/Login/UserContext';
import useAuthentication from 'hooks/useAuthentication';

import enaUserImg from 'public/images/ico_ena_user.jpg';

const Login: React.FC = () => {
  const userRef = useRef(null);
  const passwordRef = useRef(null);
  const { username, isAuthenticated } = useContext(UserContext);
  const { login, logout, loginError, loading, error } = useAuthentication();

  if (isAuthenticated) {
    return (
      <div className="vf-stack vf-stack--400">
        <div>
          You are logged in as <b>{username}</b>
        </div>
        <button type="button" className="vf-button" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  const handleSubmit = (): void => {
    login(userRef.current.value, passwordRef.current.value);
  };
  return (
    <div className="vf-grid vf-grid__col-2">
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
        {/* {loadingLogin && <Loading />} */}
        {loginError && <div className="vf-box">{loginError}</div>}
        <div className="form-forgotten">
          <a href="https://www.ebi.ac.uk/ena/submit/sra/#reset-password">
            Forgot your password?
          </a>
        </div>
      </div>
      <OutterCard>
        <h3>Not registered yet?</h3>
        <h4>
          <a href="https://www.ebi.ac.uk/ena/submit/sra/#metagenome_registration">
            Sign up
          </a>{' '}
          to register
        </h4>
        <p>or</p>
        <p>
          <a href="https://www.ebi.ac.uk/ena/submit/sra/#home">
            <img src={enaUserImg} alt="ENA member" />
          </a>
        </p>
        <p>
          If you already are a registered user of the European Nucleotide
          Archive (ENA), you should simply use your ENA account to login.
        </p>
      </OutterCard>
    </div>
  );
};

export default Login;
