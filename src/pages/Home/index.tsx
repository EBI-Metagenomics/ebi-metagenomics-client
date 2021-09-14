import React from 'react';
import SearchBy from 'components/Home/SearchBy';
import Request from 'components/Home/Request';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import Publications, { MainPublication } from 'components/Publications';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack--600">
      <h2>Getting started</h2>
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
    </section>
  );
};

export default HomePage;
