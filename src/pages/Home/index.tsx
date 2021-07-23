import React from 'react';
import SearchBy from 'components/Home/SearchBy';
import Request from 'components/Home/Request';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack--600">
      <h2>Getting started</h2>
      <div className="vf-grid">
        <SearchBy />
        <Request />
      </div>
    </section>
  );
};

export default HomePage;
