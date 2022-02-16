import React from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';
import { Link } from 'react-router-dom';

type InnerCardProps = {
  title: string;
  label: string;
  image?: string;
  imageAltText?: string;
  externalLink?: boolean;
  className?: string;
  to: string | (() => void);
  badge?: string;
};

const InnerCard: React.FC<InnerCardProps> = ({
  title,
  label,
  to,
  image,
  imageAltText,
  externalLink = false,
  className = 'vf-card--bordered',
  badge,
}) => {
  return (
    <article className={`vf-card vf-card--brand ${className}`}>
      {image && (
        <img
          src={image}
          alt={imageAltText}
          className="vf-card__image"
          loading="lazy"
        />
      )}
      <div className="vf-card__content | vf-stack vf-stack--400">
        <h3 className="vf-card__heading">
          {badge && (
            <span className="vf-badge vf-badge--tertiary">{badge}</span>
          )}
          {externalLink && typeof to === 'string' && (
            <a className="vf-card__link" href={to}>
              {title} <ArrowForLink />
            </a>
          )}
          {!externalLink && typeof to === 'string' && (
            <Link className="vf-card__link" to={to}>
              {title} <ArrowForLink />
            </Link>
          )}
          {typeof to === 'function' && (
            <button
              type="button"
              className="mg-button-as-link vf-card__link"
              onClick={to}
            >
              {title} <ArrowForLink />
            </button>
          )}
        </h3>
        <p className="vf-card__text">{label}</p>
      </div>
    </article>
  );
};

export default InnerCard;
