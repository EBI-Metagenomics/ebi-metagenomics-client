import React, { useContext } from 'react';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import UserContext from '@/pages/Login/UserContext';
import DataType from './DataType';
import Biomes from './Biomes';

const SearchBy: React.FC = () => {
  const { config } = useContext(UserContext);
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
          to={config.hmmer}
          externalLink
        />
      </div>
      <h3 className="vf-card__heading">Or by data type</h3>
      <DataType />
      <h3 className="vf-card__heading">Or by selected biomes</h3>
      <Biomes />
    </OutterCard>
  );
};

export default SearchBy;
