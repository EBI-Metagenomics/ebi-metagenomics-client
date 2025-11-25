import React from 'react';
import BranchwaterCard from 'pages/Branchwater/BranchwaterCard';

const LandingPage: React.FC = () => {
  return (
    <div className="vf-grid vf-grid__col-3">
      <BranchwaterCard
        bg="dna"
        to="/gene-search"
        title="Short DNA sequence against MGnify catalogues"
        subheading="k-mer / COBS search"
        text="Search MGnify genome catalogues using a short DNA sequence."
      />

      <BranchwaterCard
        bg="hex"
        to="/mag-search"
        title="Genome against MGnify catalogues"
        subheading="Sourmash signature compare"
        text="Compare a genome signature to MGnify MAG catalogues."
      />

      <BranchwaterCard
        bg="protein"
        to="/branchwater-search"
        title="Genome against INSDC metagenomes"
        subheading="Branchwater index search"
        text="Search for a genome's presence across INSDC metagenome assemblies."
      />
    </div>
  );
};

export default LandingPage;
