import React, { Suspense, lazy, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

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

const App: React.FC = () => {
  const [user, setUser] = useState({
    username: null,
    isAuthenticated: false,
  });
  return (
    <UserContext.Provider
      value={{
        username: user.username,
        isAuthenticated: user.isAuthenticated,
        setUser,
      }}
    >
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
