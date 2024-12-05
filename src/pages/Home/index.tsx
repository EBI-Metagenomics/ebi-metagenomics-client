import React from 'react';
import SearchBy from 'components/Home/SearchBy';
import Request from 'components/Home/Request';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import Publications, { MainPublication } from 'components/Publications';
import './style.css';
import TrainingResources from 'components/Home/TrainingResources';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack vf-stack--800">
      <div />
      <div className="vf-grid vf-grid__col-2">
        <SearchBy />
        <Request />
      </div>
      <hr />
      <BlogExcerpts />
      <h2>Latest publications</h2>
      <Publications />
      <h2>How to cite</h2>
      <MainPublication />
      <h2>Training resources</h2>
      <TrainingResources />
    </section>
  );
};

export default HomePage;
