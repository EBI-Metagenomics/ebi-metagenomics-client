import React from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';
import { Link } from 'react-router-dom';

type InnerCardProps = {
  title: string;
  label: string;
  to: string;
  image?: string;
  imageAltText?: string;
  externalLink?: boolean;
};

const InnerCard: React.FC<InnerCardProps> = ({
  title,
  label,
  to,
  image,
  imageAltText,
  externalLink = false,
}) => {
  return (
    <article className="vf-card vf-card--striped vf-card--bordered">
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
          {externalLink ? (
            <a className="vf-card__link" href={to}>
              {title} <ArrowForLink />
            </a>
          ) : (
            <Link className="vf-card__link" to={to}>
              {title} <ArrowForLink />
            </Link>
          )}
        </h3>
        <p className="vf-card__text">{label}</p>
      </div>
    </article>
  );
};

export default InnerCard;
