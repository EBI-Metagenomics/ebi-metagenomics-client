import React from 'react';
import { Link } from 'react-router-dom';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum } from 'hooks/data/useData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import TruncatedText from 'components/UI/TextTruncated';
import { getBiomeIcon } from 'utils/biomes';

import './style.css';
import { useMedia } from 'react-use';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';

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
  const isSmall = useMedia('(max-width: 768px)');
  const { data, loading, error } = useMGnifyData('studies/recent', {
    page_size: isSmall ? 3 : 20,
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  return (
    <section className="vf-stack vf-stack--200">
      <FixedHeightScrollable
        className="vf-grid vf-grid__col-1 latest-studies-section"
        heightPx={800}
      >
        {(data.data as Array<MGnifyDatum>).map(
          ({ id, attributes, relationships }) => (
            <LatestStudy
              key={id}
              id={id}
              name={attributes['study-name'] as string}
              abstract={attributes['study-abstract'] as string}
              lineage={relationships?.biomes?.data?.[0]?.id}
            />
          )
        )}
      </FixedHeightScrollable>
    </section>
  );
};

export default LatestStudies;
