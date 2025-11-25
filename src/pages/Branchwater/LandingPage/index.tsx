import React from 'react';
import BranchwaterCard from 'pages/Branchwater/BranchwaterCard';
import './style.css';

const LandingPage: React.FC = () => {
  return (
    <div className="bw-landing">
      {/* Intro Section */}
      <section className="bw-landing__intro | vf-stack vf-stack--600">
        <h1 className="vf-text-heading--2">Branchwater Search Tools</h1>

        <p className="vf-intro">
          Explore where your sequences and genomes appear across MGnify genome
          catalogues and INSDC metagenomes. Choose one of the search methods
          below to get started.
        </p>

        <p className="vf-lede">
          Not sure which option to pick? Each tool explains what it does —
          simply select the one that matches the data you have.
        </p>
      </section>

      {/* Cards Grid */}
      <div className="vf-grid vf-grid__col-3 bw-landing__cards">
        <BranchwaterCard
          bg="dna"
          to="/gene-search"
          title="Short DNA sequence against MGnify catalogues"
          subheading="k-mer / COBS search"
          text="Submit a short DNA sequence and find similar regions across MGnify’s genome catalogues."
        />

        <BranchwaterCard
          bg="hex"
          to="/mag-search"
          title="Genome against MGnify catalogues"
          subheading="Sourmash signature compare"
          text="Compare your genome (via its Sourmash signature) to all MGnify MAG catalogues."
        />

        <BranchwaterCard
          bg="protein"
          to="/branchwater-search"
          title="Genome against INSDC metagenomes"
          subheading="Branchwater index search"
          text="Identify where your genome appears across all indexed INSDC metagenomes."
        />
      </div>
    </div>
  );
};

export default LandingPage;
