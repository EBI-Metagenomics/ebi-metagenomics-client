import React from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';
import { Link } from 'react-router-dom';

import './style.css';

type InnerCardProps = {
  title: string | React.ReactNode;
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
    <article
      className={`vf-card vf-card--brand vf-card--raised ${className} inner-card`}
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
        <h3 className="vf-card__heading">
          {badge && (
            <span className="vf-badge vf-badge--tertiary vf-badge--pill inner-card__badge">
              {badge}
            </span>
          )}
          {externalLink && typeof to === 'string' && (
            <a
              className="vf-card__link"
              href={to}
              target="_blank"
              rel="noopener noreferrer"
            >
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
        <p className="vf-card__text vf-text-body--2 inner-card__text">
          {label}
        </p>
      </div>
    </article>
  );
};

export default InnerCard;
