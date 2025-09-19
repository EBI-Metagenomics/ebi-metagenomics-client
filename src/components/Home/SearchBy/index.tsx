import React from 'react';
import OutterCard from 'components/UI/OutterCard';
import DataType from './DataType';
import Biomes from './Biomes';
import './style.css';

const SearchBy: React.FC = () => {
  return (
    <OutterCard className="search-by-section">
      <h3 className="vf-card__heading">
        <span className="heading-icon">📊</span>
        Analysis Counts
      </h3>
      <DataType />
      <h3 className="vf-card__heading">
        <span className="heading-icon">🌍</span>
        Biomes
      </h3>
      <Biomes />
    </OutterCard>
  );
};

export default SearchBy;
