import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

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
const Sample = lazy(() => import('./pages/Sample'));
const SuperStudy = lazy(() => import('./pages/SuperStudy'));
const Publication = lazy(() => import('./pages/Publication'));
const GenomeCatalogue = lazy(() => import('./pages/GenomeCatalogue'));
const Genome = lazy(() => import('./pages/Genome'));
const Run = lazy(() => import('./pages/Run'));
const Assembly = lazy(() => import('./pages/Assembly'));

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
    <BrowserRouter basename={config.basename}>
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/search/*" element={<TextSearch />} />
              <Route path="/sequence-search" element={<SequenceSearch />} />
              <Route path="/browse/*" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/studies/*" element={<Study />} />
              <Route path="/super-studies/*" element={<SuperStudy />} />
              <Route path="/samples/*" element={<Sample />} />
              <Route path="/publications/*" element={<Publication />} />
              <Route
                path="/genome-catalogues/*"
                element={<GenomeCatalogue />}
              />
              <Route path="/genomes/*" element={<Genome />} />
              <Route path="/runs/*" element={<Run />} />
              <Route path="/assemblies/*" element={<Assembly />} />
            </Routes>
          </Suspense>
        </div>
        <ElixirBanner />
        <EBIFooter />
        <CookieBanner />
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export default App;
