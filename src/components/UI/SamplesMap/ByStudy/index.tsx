import React, { useState, useContext } from 'react';

import { Wrapper } from '@googlemaps/react-wrapper';

import useSamplesProvider from 'hooks/data/useSamplesProvider';

import UserContext from 'pages/Login/UserContext';
import SamplesMap from 'components/UI/SamplesMap';
import render from '../render';
import '../style.css';
import InfoBanner from '../../InfoBanner';

const LIMIT = 200;

type LoadMoreSamplesProps = {
  total: number;
  limit: number;
  handleRequest: () => void;
};

const LoadMoreSamples: React.FC<LoadMoreSamplesProps> = ({
  total,
  limit,
  handleRequest,
}) =>
  total > limit ? (
    <div>
      ⚠️ We are only loading the first {LIMIT} samples. Click{' '}
      <button
        type="button"
        className="vf-button vf-button--link mg-button-as-link"
        onClick={handleRequest}
      >
        HERE
      </button>{' '}
      to load them all.
    </div>
  ) : null;
type SamplesMapProps = {
  study: string;
};
const SamplesMapByStudy: React.FC<SamplesMapProps> = ({ study }) => {
  const [limit, setLimit] = useState(LIMIT);
  const { samples, total } = useSamplesProvider(study, limit);
  const { config } = useContext(UserContext);

  const samplesFiltered = samples.filter((sample) => {
    try {
      return (
        Number(sample.attributes.longitude) !== 0.0 &&
        Number(sample.attributes.latitude) !== 0.0
      );
    } catch {
      return false;
    }
  });
  if (samplesFiltered.length === 0) {
    return (
      <InfoBanner type="info" title="Notice">
        None of the {total > limit ? 'loaded' : ''} samples have geolocation
        co-ordinates.
        <LoadMoreSamples
          total={total}
          limit={limit}
          handleRequest={() => setLimit(total)}
        />
      </InfoBanner>
    );
  }

  return (
    <div className="mg-map-container">
      <div className="mg-map-wrapper">
        <Wrapper apiKey={config.googleMapsKey} render={render}>
          <SamplesMap samples={samplesFiltered} />
        </Wrapper>
      </div>
      {total && (
        <div className="mg-map-progress">
          <progress max={total} value={samples.length} />
          <LoadMoreSamples
            total={total}
            limit={limit}
            handleRequest={() => setLimit(total)}
          />
        </div>
      )}
    </div>
  );
};

export default SamplesMapByStudy;
