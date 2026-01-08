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
  abstract: string;
  lineage?: string;
};
const LatestStudy: React.FC<LatestStudyProps> = ({
  id,
  name,
  abstract,
  lineage,
}) => {
  const icon = getBiomeIcon(lineage ?? '');
  return (
    <article className="vf-summary vf-summary--has-image study">
      <span className={`biome_icon icon_xs ${icon}`} />
      <h3 className="vf-summary__title">
        <Link to={`/studies/${id}`} className="vf-summary__link">
          <TruncatedText text={name} maxLength={100} />
        </Link>
      </h3>
      <p className="vf-summary__text vf-u-type__text-body--5">
        <TruncatedText text={abstract} />
      </p>
      {/* <div className="vf-summary__text vf-grid">
        <Link to={`/studies/${id}`} className="vf-button vf-button--sm">
          View more
        </Link>
        <Link
          to={`/studies/${id}#samples-section`}
          className="vf-button vf-button--sm"
        >
          Samples
        </Link>
      </div> */}
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
        heightPx={800}
      >
        {}
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
              abstract={`Last updated on ${new Date(
                updated_at
              ).toLocaleDateString()} `}
            />
          )
        )}
      </FixedHeightScrollable>
    </section>
  );
};

export default LatestStudies;
