import React from 'react';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import LatestStudies from './LatestStudies';

const SearchBy: React.FC = () => {
  return (
    <OutterCard className="request-by-section">
      <h3 className="vf-card__heading">Request analysis of</h3>
      <div className="vf-grid">
        <InnerCard title="Submit and/or Request" label="Your data" to="/" />
        <InnerCard title="Request" label="A public dataset" to="/" />
      </div>
      <h3 className="vf-card__heading">Latest studies</h3>
      <LatestStudies />
    </OutterCard>
  );
};

export default SearchBy;
