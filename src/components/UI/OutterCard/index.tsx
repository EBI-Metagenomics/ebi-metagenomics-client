import React from 'react';

const OutterCard: React.FC<{
  className?: string;
  image?: string;
  imageAltText?: string;
}> = ({ children, className = '', image = null, imageAltText = '' }) => {
  return (
    <article
      className={`vf-card vf-card--brand vf-card--bordered ${className}`}
    >
      {image && (
        <img
          src={image}
          alt={imageAltText}
          className="vf-card__image"
          loading="lazy"
        />
      )}
      <div className="vf-card__content | vf-stack vf-stack--400">
        {children}
      </div>
    </article>
  );
};

export default OutterCard;
