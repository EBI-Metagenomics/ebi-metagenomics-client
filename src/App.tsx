import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';

import mergePrivateConfig from 'utils/config';
import initialConfig from 'config.json';
import EBIHeader from './components/UI/EBIHeader';
import HeroHeader from './components/UI/HeroHeader';
import EBIFooter from './components/UI/EBIFooter';
import ElixirBanner from './components/UI/ElixirBanner';
import CookieBanner from './components/UI/CookieBanner';
import MainMenu from './components/Nav/MainMenu';
import Loading from './components/UI/Loading';
import LoginMonitor from './components/Login/Monitor';

import UserContext from './pages/Login/UserContext';

import './App.css';
import './styles/biomes.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));
const TextSearch = lazy(() => import('./pages/TextSearch'));
const SequenceSearch = lazy(() => import('./pages/SequenceSearch'));
const Browse = lazy(() => import('./pages/Browse'));
const Login = lazy(() => import('./pages/Login'));
const Submit = lazy(() => import('./pages/Submit'));
const Study = lazy(() => import('./pages/Study'));

const App: React.FC = () => {
  const [user, setUser] = useState({
    username: null,
    isAuthenticated: false,
  });
  const [config, setConfig] = useState(initialConfig);
  const [details, setDetails] = useState(null);
  useEffect(() => {
    mergePrivateConfig(setConfig);
  }, []);
  const value = useMemo(
    () => ({
      username: user.username,
      isAuthenticated: user.isAuthenticated,
      details,
      setUser,
      setDetails,
      config,
    }),
    [config, details, user.isAuthenticated, user.username]
  );
  return (
    <UserContext.Provider value={value}>
      <LoginMonitor />
      <EBIHeader />
      <HeroHeader />
      <MainMenu />
      <div
        className="vf-body"
        style={{ marginBottom: '1em', marginTop: '0.5em' }}
      >
        <Suspense fallback={<Loading size="large" />}>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/help">
              <Help />
            </Route>
            <Route path="/search">
              <TextSearch />
            </Route>
            <Route path="/sequence-search">
              <SequenceSearch />
            </Route>
            <Route path="/browse">
              <Browse />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/submit">
              <Submit />
            </Route>
            <Route path="/studies">
              <Study />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Suspense>
      </div>
      <ElixirBanner />
      <EBIFooter />
      <CookieBanner />
    </UserContext.Provider>
  );
};

export default App;