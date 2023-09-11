import React, {
  useContext,
  useRef,
  FormEvent,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import OutterCard from 'components/UI/OutterCard';

import UserContext from 'pages/Login/UserContext';
import useAuthentication from 'hooks/useAuthentication';

import enaUserImg from 'public/images/ico_ena_user.jpg';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

import { useToken } from 'hooks/useToken';
import { useUser } from 'hooks/useUser';
import AuthContext from 'pages/Login/AuthContext';
import axios from 'utils/axios';

const Login: React.FC = () => {
  const [token, setToken] = useToken();
  // const user = useUser();
  // const { username } = user || {};
  const { config } = useContext(UserContext);

  // const { setAuth } = useContext(AuthContext);

  const usernameRef = useRef(null);
  const errRef = useRef(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  // const [success, setSuccess] = useState(false);
  const passwordRef = useRef(null);
  const [loginErrorMessage, setLoginError] = React.useState(null);
  // const { username, isAuthenticated } = useContext(UserContext);
  const { isAuthenticated } = useContext(UserContext);
  const { login, logout, loginError, loading, error } = useAuthentication();
  const [from] = useQueryParamState('from', '');
  const navigate = useNavigate();
  const location = useLocation();

  // const redirectedFrom = location?.state?.from?.pathname || '/login';
  // console.log('location', location);

  // TODO redirect to the page where the user was before login does not work as expected
  // Some React craziness is going on here
  // initially location.state.from.pathname contains the correct value
  // but then the page gets re-rendered 3 more times, and the value of location.state.from.pathname becomes undefined
  // not sure why the page gets re-rendered 3 extra times
  // thought useMemo would fix it, but it does not
  // Will invesitgate further
  const redirectedFrom = useMemo(() => {
    if (
      location &&
      location.state &&
      location.state.from &&
      location.state.from.pathname
    ) {
      return location.state.from.pathname;
    }
    return '/login';
  }, [location]);

  console.log('location', location);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // useEffect(() => {
  //   setErrMsg('');
  // }, [username, password]);

  if (isAuthenticated) {
    if (from === 'private-request') {
      navigate('/?show=private-request');
      return null;
    }
    if (from === 'public-request') {
      navigate('/?show=public-request');
      return null;
    }
    alert('isAuthenticated');
    console.log('from', from);
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
  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    // login(userRef.current.value, passwordRef.current.value);
    // const response = await axios.post(`${config.api}utils/token/obtain`, {
    //   username: userRef.current.value,
    //   password: passwordRef.current.value,
    // });

    try {
      const response = await axios.post(`/utils/token/obtain`, {
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      });
      const accessToken = response.data.data.token;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setToken(accessToken) as unknown as void;
      // setAuth({ accessToken });
      setUsername('');
      setPassword('');
      navigate(redirectedFrom, { replace: true });
    } catch (error) {
      if (!error.response) {
        setErrMsg('Network error');
      } else if (error.response.status === 400) {
        setErrMsg('Invalid credentials');
      } else if (error.response.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg('Login failed');
      }
      errRef.current?.focus();
    }

    // axios
    //   .post(`${config.api}utils/token/obtain`, {
    //     username: usernameRef.current.value,
    //     password: passwordRef.current.value,
    //   })
    //   .then((response) => {
    //     console.log('response', response.data.data);
    //     const receivedToken = response.data.data.token;
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     setToken(receivedToken) as unknown as void;
    //
    //     console.log('user', username);
    //     console.log(isAuthenticated);
    //   })
    //   .catch((err) => {
    //     // record errors
    //     console.log('errors', err);
    //     setLoginError(err.response.data.errors.non_field_errors[0]);
    //   });
  };
  return (
    <section className="vf-grid vf-grid__col-2">
      <div className="vf-form vf-stack vf-stack--400">
        <form onSubmit={handleSubmit}>
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
              ref={usernameRef}
              onChange={(e) => setUsername(e.target.value)}
              value={username}
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
              id="id_password"
              className="vf-form__input"
              ref={passwordRef}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          {/* Conditionally display login error message */}
          {errMsg && (
            <p
              ref={errRef}
              className="vf-form__helper vf-form__helper--error"
              aria-live="assertive"
            >
              {errMsg}
            </p>
          )}

          <br />
          <div className="form-actions-no-box">
            <button
              type="submit"
              name="submit"
              className="vf-button"
              id="submit-id-submit"
            >
              Log in
            </button>
          </div>
        </form>
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
    </section>
  );
};

export default Login;
