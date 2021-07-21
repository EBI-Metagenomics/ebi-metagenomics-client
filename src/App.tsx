import React from 'react';
import './App.css';
import EBIHeader from './components/UI/EBIHeader';
import EBIFooter from './components/UI/EBIFooter';
import CookieBanner from './components/UI/CookieBanner';

const App: React.FC = () => (
  <>
    <EBIHeader />
    <section className="vf-content">
      <h1>MGnify - EBI.</h1>
    </section>
    <EBIFooter />
    <CookieBanner />
  </>
);

export default App;
