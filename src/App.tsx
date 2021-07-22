import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

import EBIHeader from './components/UI/EBIHeader';
import HeroHeader from './components/UI/HeroHeader';
import EBIFooter from './components/UI/EBIFooter';
import CookieBanner from './components/UI/CookieBanner';
import MainMenu from './components/Nav/MainMenu';

import './App.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));

const App: React.FC = () => (
  <>
    <EBIHeader />
    <MainMenu />
    <HeroHeader />
    <Suspense fallback={() => <div>Loading</div>}>
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/help">
          <Help />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Suspense>
    <EBIFooter />
    <CookieBanner />
  </>
);

export default App;
