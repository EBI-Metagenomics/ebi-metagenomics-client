import React from 'react';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import Publications, { MainPublication } from 'components/Publications';
import './style.css';
import TrainingResources from 'components/Home/TrainingResources';
import EarlyAccessExplainer from 'components/Home/EarlyAccess/Explainer';
import LatestStudies from 'components/Home/Request/LatestStudies';
import Link from 'components/UI/Link';
import OutterCard from 'components/UI/OutterCard';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack vf-stack--800">
      <div />
      <div className="vf-grid vf-grid__col-2">
        <OutterCard>
          <h2 className="vf-card__heading">MGnify V6 Early Data Release</h2>
          <EarlyAccessExplainer />
        </OutterCard>
        <OutterCard>
          <h2 className="vf-card__heading">Latest studies</h2>
          <LatestStudies />
          <div className="mg-right">
            <Link
              to="/browse/studies/"
              className="vf-button vf-button--primary"
            >
              View all studies
            </Link>
          </div>
        </OutterCard>
      </div>
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
