import React from 'react';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import DataType from './DataType';

const SearchBy: React.FC = () => {
  return (
    <OutterCard className="search-by-section">
      <h3 className="vf-card__heading">Search by</h3>
      <div className="vf-grid">
        <InnerCard
          title="Text search"
          label="Name, biome, or keyword"
          to="/search"
        />
        <InnerCard
          title="Sequence search"
          label="Sequence search"
          to="/sequence-search"
        />
      </div>
      <h3 className="vf-card__heading">Or by data type</h3>
      <DataType />
      <h3 className="vf-card__heading">Or by selected biomes</h3>
    </OutterCard>
  );
};

export default SearchBy;
