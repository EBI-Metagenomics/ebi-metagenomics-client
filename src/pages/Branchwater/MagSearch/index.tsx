import React from 'react';
import SourmashSearch from 'components/Genomes/Sourmash';

const MagSearch: React.FC = () => {
  return (
    <div>
      <h2>Genome against MGnify catalogues</h2>
      <p>
        <SourmashSearch />
      </p>
    </div>
  );
};

export default MagSearch;
