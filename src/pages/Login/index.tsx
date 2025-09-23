import React, {
  FormEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OutterCard from 'components/UI/OutterCard';
import UserContext from 'pages/Login/UserContext';
import enaUserImg from 'public/images/ico_ena_user.jpg';
import useAuthToken from 'hooks/authentication/useAuthToken';
import axios from 'utils/protectedAxios';
import Loading from 'components/UI/Loading';

const Login: React.FC = () => {
  const [, setAuthToken] = useAuthToken();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const loginErrorsContainerRef = useRef(null);

  const loggedInUsername = localStorage.getItem('mgnify.v2.username');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(UserContext);
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const [desiredDestination, setDesiredDestination] = useState('');

  useMemo(() => {
    const possibleDesiredDestinations = {
      '?from=private-request': '/?from=private-request',
      '?from=public-request': '/?from=public-request',
    };
    if (possibleDesiredDestinations[search]) {
      setDesiredDestination(possibleDesiredDestinations[search]);
      return;
    }
    if (state?.from?.pathname) {
      setDesiredDestination(state.from.pathname + search);
    }
  }, [state?.from, search]);

  const handleLogout = async () => {
    // @ts-ignore
    setAuthToken(null);
    localStorage.removeItem('mgnify.v2.token');
    localStorage.removeItem('mgnify.v2.username');
  };

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  if (isAuthenticated) {
    return (
      <div className="vf-stack vf-stack--400">
        <div>
          You are logged in as <b>{loggedInUsername}</b>
        </div>
        <button type="button" className="vf-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`/auth/sliding`, {
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      });
      const accessToken = response.data.token;

      // @ts-ignore
      setAuthToken(accessToken) as unknown as void;
      setUsername('');
      setPassword('');
      navigate(desiredDestination);
    } catch (error) {
      if (!error.response) {
        setErrMsg('Network error');
      } else {
        setErrMsg(error.response.data.detail);
      }
      loginErrorsContainerRef.current?.focus();
    } finally {
      setLoading(false);
    }
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

          {errMsg && (
            <p
              ref={loginErrorsContainerRef}
              className="vf-form__helper vf-form__helper--error"
              aria-live="assertive"
            >
              {errMsg}
            </p>
          )}

          <br />
          <div className="form-actions-no-box">
            {loading ? (
              <Loading size="small" />
            ) : (
              <button
                type="submit"
                name="submit"
                className="vf-button vf-button--primary"
                id="submit-id-submit"
              >
                Log in
              </button>
            )}
          </div>
        </form>
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
