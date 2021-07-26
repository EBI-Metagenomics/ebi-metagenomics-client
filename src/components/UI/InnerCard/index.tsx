import React from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';
import { Link } from 'react-router-dom';
type InnerCardProps = {
  title: string;
  label: string;
  to: string;
};

const InnerCard: React.FC<InnerCardProps> = ({ title, label, to }) => {
  return (
    <article className="vf-card vf-card--brand vf-card--striped vf-card--bordered">
      <div className="vf-card__content | vf-stack vf-stack--400">
        <p className="vf-card__text">{label}</p>
        <h3 className="vf-card__heading">
          <Link className="vf-card__link" to={to}>
            {title} <ArrowForLink />
          </Link>
        </h3>
      </div>
    </article>
  );
};

export default InnerCard;
