import React from 'react';

const OutterCard: React.FC<{ className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <article
      className={`vf-card vf-card--brand vf-card--bordered ${className}`}
    >
      <div className="vf-card__content | vf-stack vf-stack--400">
        {children}
      </div>
    </article>
  );
};

export default OutterCard;
