import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import TruncatedText from 'components/UI/TextTruncated';
import { getBiomeIcon } from '@/utils/biomes';

import './style.css';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import useStudiesList from 'hooks/data/useStudies';

type LatestStudyProps = {
  id: string;
  name: string;
  updatedAt: string;
  lineage?: string;
};
const LatestStudy: React.FC<LatestStudyProps> = ({
  id,
  name,
  updatedAt,
  lineage,
}) => {
  const icon = getBiomeIcon(lineage ?? '');
  return (
    <article className="vf-summary vf-summary--has-image study">
      <div className="study-header">
        <span className={`biome_icon icon_xs ${icon}`} title={lineage} />
        <span className="study-accession">{id}</span>
      </div>
      <h3 className="vf-summary__title">
        <Link to={`/studies/${id}`} className="vf-summary__link">
          <TruncatedText text={name} maxLength={240} />
        </Link>
      </h3>
      <div className="study-metadata">
        <p className="vf-summary__text vf-u-type__text-body--5">
          <span className="metadata-label">Last updated:</span>{' '}
          {new Date(updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className="vf-summary__text study-actions">
        <Link
          to={`/studies/${id}`}
          className="vf-button vf-button--primary vf-button--sm"
        >
          View study
        </Link>
        <Link
          to={`/studies/${id}#samples-section`}
          className="vf-button vf-button--secondary vf-button--sm"
        >
          Samples
        </Link>
      </div>
    </article>
  );
};

const LatestStudies: React.FC = () => {
  const { data, loading, error } = useStudiesList({
    page: 1,
    order: '-updated_at',
    has_analyses_from_pipeline: 'V6',
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  return (
    <section className="vf-stack vf-stack--200" style={{ width: '100%' }}>
      <FixedHeightScrollable
        className="vf-grid vf-grid__col-1 latest-studies-section"
        wrapperClassName="latest-studies-section-container"
        heightPx={400}
      >
        {data.items.map(
          ({
            accession,
            updated_at,
            biome,
            title,
          }: {
            accession?: string;
            updated_at: string;
            biome: { lineage: string };
            title: string;
          }) => (
            <LatestStudy
              key={accession as string}
              id={accession as string}
              name={title}
              lineage={biome.lineage}
              updatedAt={updated_at}
            />
          )
        )}
      </FixedHeightScrollable>
      <div className="latest-studies-footer">
        <Link to="/studies" className="vf-link">
          View all studies &rarr;
        </Link>
      </div>
    </section>
  );
};

export default LatestStudies;
