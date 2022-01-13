import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

import MGnifyLogo from 'images/mgnify_logo_reverse.svg';

const HeroHeader: React.FC = () => {
  return (
    <section className="vf-hero vf-hero--400 | vf-u-fullbleed">
      <div className="vf-hero__content | vf-box | vf-stack vf-stack--400">
        <p className="vf-hero__kicker">
          <a href="https://ebi.ac.uk">EMBL-EBI</a> | MGnify
        </p>
        <h4>
          <Link to="/">
            <img src={MGnifyLogo} alt="MGnify Logo" style={{ height: '4em' }} />
          </Link>
        </h4>

        <p className="vf-hero__subheading">
          Submit, analyse, discover and compare microbiome data
        </p>
      </div>
    </section>
  );
};

export default HeroHeader;
