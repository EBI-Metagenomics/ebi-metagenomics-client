import React from 'react';
import CobsSearch from 'components/Genomes/Cobs';

const GeneSearch: React.FC = () => {
  return (
    <div>
      <h2>Short DNA sequence against MGnify catalogues</h2>
      <p>
        <CobsSearch />
      </p>
    </div>
  );
};

export default GeneSearch;
