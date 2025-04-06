import React from 'react';
import SearchBy from 'components/Home/SearchBy';
import Request from 'components/Home/Request';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import Publications, { MainPublication } from 'components/Publications';
import './style.css';
import TrainingResources from 'components/Home/TrainingResources';
import EarlyAccessExplainer from 'components/Home/EarlyAccess/Explainer';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack vf-stack--800">
      <div />
      <h2>MGnify V6 Early Data Release</h2>
      <EarlyAccessExplainer />
      <hr />
      <BlogExcerpts />
      <h2>Latest publications</h2>
      <Publications />
      <h2>How to cite</h2>
      <MainPublication />
      <h2>EMBL-EBI Training</h2>
      <TrainingResources />
    </section>
  );
};

export default HomePage;
