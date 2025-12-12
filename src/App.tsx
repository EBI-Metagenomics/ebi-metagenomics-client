import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

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
import UserContext, {
  UserContextType,
  UserDetails,
  UserType,
} from 'pages/Login/UserContext';

import './App.css';
import './styles/biomes.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import './styles/search.css';
import { ToastContainer } from 'react-toastify';
import Matomo from 'components/Analytics';
import PersistLogin from 'components/PersistLogin';
// import SearchPage from './pages/Search';
// import Branchwater from './pages/Branchwater';
// import PersistLogin from 'components/PersistLogin';
import V2AssemblyPage from 'pages/Assembly/v2index';

import LandingPage from 'pages/Branchwater/LandingPage';
import MagSearch from 'pages/Branchwater/MagSearch';
import GeneSearch from 'pages/Branchwater/GeneSearch';
import V2AnalysisPage from 'pages/Analysis/v2index';
import SessionExpiryBanner from 'components/UI/SessionExpiryBanner';
import PersistLogin from 'components/PersistLogin';
import MyDataStudies from './pages/MyData/MyDataStudies';
import NotFoundError from 'components/UI/NotFoundError';

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
const Branchwater = lazy(() => import('pages/Branchwater'));

const ResetScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>({
    username: null,
    isAuthenticated: false,
    token: null,
  });
  const [details, setDetails] = useState<UserDetails | null>([]);
  const value = useMemo<UserContextType>(
    () => ({
      username: user?.username || null,
      isAuthenticated: user?.isAuthenticated || false,
      details,
      setUser,
      setDetails,
      config,
      token: user?.token || null,
    }),
    [details, user?.isAuthenticated, user?.username, user?.token]
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UserContext.Provider value={value}>
        <Matomo />
        <ToastContainer />
        <EBIHeader />
        <HeroHeader />
        <MainMenu />
        <SessionExpiryBanner />
        <PersistLogin />
        <div className="vf-body vf-u-margin__top--400 vf-u-margin__bottom--800">
          <ErrorBoundary>
            <ResetScroll />
            <Suspense fallback={<Loading size="large" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                {/* <Route path="/search/*" element={<TextSearch />} /> */}
                {/* <Route path="/sequence-search" element={<SequenceSearch />} /> */}
                <Route path="/browse/*" element={<Browse />} />
                <Route path="/studies/:accession/*" element={<Study />} />
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
                <Route
                  path="/v2-analyses/:accession/*"
                  element={<V2AnalysisPage />}
                />
                <Route path="/mydata/*" element={<MyData />}>
                  <Route index element={<MyDataStudies />} />
                  <Route path="studies" element={<MyDataStudies />} />
                </Route>
                {/* <Route element={<PersistLogin />}> */}
                <Route path="/login" element={<Login />} />
                {/* </Route> */}
                <Route path="*" element={<NotFoundError />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        <ElixirBanner />
        <EBIFooter />
        <CookieBanner />
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export default App;
