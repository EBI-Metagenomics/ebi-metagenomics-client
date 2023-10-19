import React, { Suspense, lazy, useState, useMemo } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import config from 'utils/config';
import EBIHeader from 'components/UI/EBIHeader';
import HeroHeader from 'components/UI/HeroHeader';
import EBIFooter from 'components/UI/EBIFooter';
import ElixirBanner from 'components/UI/ElixirBanner';
import CookieBanner from 'components/UI/CookieBanner';
import MainMenu from 'components/Nav/MainMenu';
import Loading from 'components/UI/Loading';
import ErrorBoundary from 'components/ErrorBoundary';
import MyData from 'pages/MyData';
import UserContext from 'pages/Login/UserContext';

import './App.css';
import './styles/biomes.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import './styles/search.css';
import { ToastContainer } from 'react-toastify';
import QueryParamsProvider from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import Matomo from 'components/Analytics';
import PersistLogin from 'components/PersistLogin';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));
const TextSearch = lazy(() => import('./pages/TextSearch'));
const SequenceSearch = lazy(() => import('./pages/SequenceSearch'));
const Browse = lazy(() => import('./pages/Browse'));
const Login = lazy(() => import('./pages/Login'));
const Study = lazy(() => import('./pages/Study'));
const Sample = lazy(() => import('./pages/Sample'));
const SuperStudy = lazy(() => import('./pages/SuperStudy'));
const Publication = lazy(() => import('./pages/Publication'));
const GenomeCatalogue = lazy(() => import('./pages/GenomeCatalogue'));
const Genome = lazy(() => import('./pages/Genome'));
const Run = lazy(() => import('./pages/Run'));
const Assembly = lazy(() => import('./pages/Assembly'));
const Pipelines = lazy(() => import('./pages/Pipelines'));
const Analysis = lazy(() => import('./pages/Analysis'));

const App: React.FC = () => {
  const [user, setUser] = useState({
    username: null,
    isAuthenticated: false,
    token: null,
  });
  const [details, setDetails] = useState(null);
  const value = useMemo(
    () => ({
      username: user.username,
      isAuthenticated: user.isAuthenticated,
      details,
      setUser,
      setDetails,
      config,
      token: user.token,
    }),
    [details, user.isAuthenticated, user.username]
  );

  return (
    <BrowserRouter basename={config.basename}>
      <UserContext.Provider value={value}>
        <QueryParamsProvider>
          <Matomo />
          <ToastContainer />
          <EBIHeader />
          <HeroHeader />
          <MainMenu />
          <div className="vf-body vf-u-margin__top--400 vf-u-margin__bottom--800">
            <ErrorBoundary>
              <Suspense fallback={<Loading size="large" />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/search/*" element={<TextSearch />} />
                  <Route path="/sequence-search" element={<SequenceSearch />} />
                  <Route path="/browse/*" element={<Browse />} />
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
                  <Route path="/pipelines/*" element={<Pipelines />} />
                  <Route path="/analyses/*" element={<Analysis />} />
                  <Route path="/mydata" element={<MyData />} />
                  <Route element={<PersistLogin />}>
                    <Route path="/login" element={<Login />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
          <ElixirBanner />
          <EBIFooter />
          <CookieBanner />
        </QueryParamsProvider>
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export default App;
