import React from 'react';

const InfoBanner: React.FC = ({ children }) => {
  return (
    <div className="vf-banner vf-banner--alert vf-banner--info">
      <div className="vf-banner__content">{children}</div>
    </div>
  );
};

export default InfoBanner;
