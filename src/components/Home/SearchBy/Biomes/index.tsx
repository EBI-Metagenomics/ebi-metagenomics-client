import React from 'react';
import { Link } from 'react-router-dom';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { getBiomeIcon } from 'utils/biomes';

const Biome: React.FC<{ lineage: string; name: string; count: number }> = ({
  lineage,
  name,
  count,
}) => {
  return (
    <div>
      <Link
        to={`/metagenomics/browse?lineage=${lineage}#studies`}
        className="vf-grid vf-grid__col-1 mg-link"
        style={{ textAlign: 'center', gridRowGap: '0.2em' }}
      >
        <div>
          <span
            className={`biome_icon icon_sm ${getBiomeIcon(lineage)}`}
            style={{ float: 'initial' }}
          />
        </div>
        <div className="biome-text">
          {' '}
          {name} ({count})
        </div>
      </Link>
    </div>
  );
};

const Biomes: React.FC = () => {
  const { data, loading, error } = useMGnifyData('biomes/top10', {
    ordering: '-samples_count',
  });
  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;

  return (
    <section className="vf-stack vf-stack--200 search-by-biomes-section">
      <div className="vf-grid vf-grid__col-5">
        {(data as MGnifyResponseList).data.map(({ id, attributes }) => (
          <Biome
            key={id}
            lineage={id}
            name={attributes['biome-name'] as string}
            count={attributes['samples-count'] as number}
          />
        ))}
      </div>
      <div className="mg-right">
        <Link to="/biomes/" className="vf-button vf-button--primary">
          View all biomes
        </Link>
      </div>
    </section>
  );
};

export default Biomes;
