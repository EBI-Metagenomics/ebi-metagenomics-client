import React from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';

type InnerCardProps = {
  title: string;
  label: string;
  to: string;
};

const InnerCard: React.FC<InnerCardProps> = ({ title, label, to }) => {
  return (
    <article className="vf-card vf-card--brand vf-card--striped">
      <div className="vf-card__content | vf-stack vf-stack--400">
        <p className="vf-card__text">{label}</p>
        <h3 className="vf-card__heading">
          <a className="vf-card__link" href={to}>
            {title} <ArrowForLink />
          </a>
        </h3>
      </div>
    </article>
  );
};

export default InnerCard;
