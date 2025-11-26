import React from 'react';
import BranchwaterCard from 'pages/Branchwater/BranchwaterCard';
import './style.css';

const LandingPage: React.FC = () => {
  return (
    <div className="bw-landing">
      {/* Breadcrumbs */}
      <nav className="vf-breadcrumbs" aria-label="Breadcrumb">
        <ul className="vf-breadcrumbs__list | vf-list vf-list--inline">
          <li className="vf-breadcrumbs__item">
            <a href="/" className="vf-breadcrumbs__link">
              Overview
            </a>
          </li>

          <li className="vf-breadcrumbs__item" aria-current="location">
            Nucleotide Sequence Search Tools
          </li>
        </ul>

        <span className="vf-breadcrumbs__heading">Related:</span>
        <ul className="vf-breadcrumbs__list vf-breadcrumbs__list--related | vf-list vf-list--inline">
          <li className="vf-breadcrumbs__item">
            <a
              href="https://www.ebi.ac.uk/metagenomics/proteins/"
              className="vf-breadcrumbs__link"
            >
              MGnify Proteins
            </a>
          </li>
        </ul>
      </nav>
      {/* Intro Section */}
      <section className="bw-landing__intro | vf-stack vf-stack--600">
        <h1 className="vf-text-heading--2">Nucleotide Sequence Search Tools</h1>

        <p className="vf-intro">
          Explore where your genome sequences or fragments appear across MGnify
          genome catalogues and INSDC metagenomes. Choose one of the search
          methods below to get started.
        </p>
      </section>

      {/* Cards Grid */}
      <div className="vf-grid vf-grid__col-3 bw-landing__cards">
        <BranchwaterCard
          bg="protein"
          to="/branchwater-search"
          title="Search genomes against INSDC metagenomes"
          subheading="Branchwater index search"
          text="Identify where your genome appears across all indexed INSDC metagenomes."
        />

        <BranchwaterCard
          bg="hex"
          to="/mag-search"
          title="Search genomes against MGnify catalogues"
          subheading="Sourmash signature compare"
          text="Compare your genome (via its Sourmash signature) to all MGnify MAG catalogues."
        />

        <BranchwaterCard
          bg="dna"
          to="/gene-search"
          title="Search short DNA sequences against MGnify catalogues"
          subheading="COBS search"
          text="Submit a short DNA sequence and find similar regions across MGnify’s genome catalogues."
        />
      </div>
    </div>
  );
};

export default LandingPage;
