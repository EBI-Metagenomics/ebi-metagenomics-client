import React from 'react';
import SearchBy from 'components/Home/SearchBy';
import Request from 'components/Home/Request';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import ExtLink from 'components/UI/ExtLink';
import Publications, { MainPublication } from 'components/Publications';
import './style.css';

const HomePage: React.FC = () => {
  return (
    <section className="vf-content vf-stack vf-stack--800">
      <div />
      <div className="vf-banner vf-banner--alert vf-banner--info">
        <div className="vf-banner__content">
          <p className="vf-banner__text">
            Do data resources managed by EMBL-EBI and our collaborators make a
            difference to your work?
            <br />
            Please take 10 minutes to fill in our{' '}
            <ExtLink href="https://www.surveymonkey.com/r/HJKYKTT?channel=[webpage]">
              annual user survey
            </ExtLink>
            , and help us make the case for why sustaining open data resources
            is critical for life sciences research.
          </p>
        </div>
      </div>
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
    </section>
  );
};

export default HomePage;
