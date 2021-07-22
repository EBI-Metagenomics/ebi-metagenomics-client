import React from 'react';
import './style.css';
// import MGnifyHeader from 'images/embl-ebi-background-4.jpg';
import MGnifyLogo from 'images/mgnify_logo_reverse.svg';

const HeroHeader: React.FC = () => {
  return (
    <section className="vf-hero vf-hero--400 | vf-u-fullbleed">
      <div className="vf-hero__content | vf-box | vf-stack vf-stack--400">
        <img src={MGnifyLogo} alt="MGnify Logo" style={{ height: '4em' }} />

        <p className="vf-hero__subheading">
          Submit, analyse, discover and compare microbiome data
        </p>
      </div>
    </section>
  );
};

export default HeroHeader;
