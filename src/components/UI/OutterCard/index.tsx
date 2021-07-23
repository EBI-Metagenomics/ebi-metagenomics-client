import React from 'react';

const OutterCard: React.FC = ({ children }) => {
  return (
    <article className="vf-card vf-card--brand vf-card--bordered">
      <div className="vf-card__content | vf-stack vf-stack--400">
        {children}
      </div>
    </article>
  );
};

export default OutterCard;
