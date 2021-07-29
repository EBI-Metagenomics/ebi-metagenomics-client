import React from 'react';
import { Link } from 'react-router-dom';

import { useMGnifyData } from 'hooks/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { getBiomeIcon } from 'utils/biomes';

import './style.css';

type LatestStudyProps = {
  id: string;
  name: string;
  abstract: string;
  lineage?: string;
};
const LatestStudy: React.FC<LatestStudyProps> = ({
  id,
  name,
  abstract,
  lineage,
}) => {
  const icon = getBiomeIcon(lineage);
  return (
    <article className="vf-summary vf-summary--has-image study">
      <span className={`biome_icon icon_xs ${icon}`} />
      <h3 className="vf-summary__title">
        <Link to={`/studies/${id}`} className="vf-summary__link">
          {name}
        </Link>
      </h3>
      <p className="vf-summary__text">
        {abstract.substring(0, 250)}
        {abstract.length >= 250 && '...'}
      </p>
      <div className="vf-summary__text vf-grid">
        <Link to={`/studies/${id}`} className="vf-button vf-button--sm">
          View more
        </Link>
        <Link
          to={`/studies/${id}#samples-section`}
          className="vf-button vf-button--sm"
        >
          Samples
        </Link>
      </div>
    </article>
  );
};

const LatestStudies: React.FC = () => {
  const { data, loading, error } = useMGnifyData('studies/recent');
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  return (
    <section className="vf-stack vf-stack--200">
      <div className="vf-grid vf-grid__col-1 latest-studies-section">
        {data.data.map(({ id, attributes, relationships }) => (
          <LatestStudy
            key={id}
            id={id}
            name={attributes['study-name'] as string}
            abstract={attributes['study-abstract'] as string}
            lineage={relationships?.biomes?.data?.[0]?.id}
          />
        ))}
      </div>
      <div className="mg-right">
        <Link to="/browse/studies/" className="vf-button vf-button--primary">
          View all studies
        </Link>
      </div>
    </section>
  );
};

export default LatestStudies;
