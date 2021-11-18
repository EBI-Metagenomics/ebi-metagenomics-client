import React, { useState, useContext } from 'react';

import { Wrapper } from '@googlemaps/react-wrapper';

import useSamplesProvider from 'hooks/data/useSamplesProvider';

import UserContext from 'pages/Login/UserContext';
import SamplesMap from 'components/UI/SamplesMap';
import render from '../render';
import '../style.css';

const LIMIT = 200;

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
          {total > limit && (
            <div>
              ⚠️ We are only loading the first {LIMIT} samples. Click{' '}
              <button
                type="button"
                className="vf-button vf-button--link mg-button-as-link"
                onClick={() => setLimit(total)}
              >
                HERE
              </button>{' '}
              to load them all.
            </div>
          )}
          {samplesFiltered.length === 0 && (
            <div>
              ⚠️ None of the {total > limit ? 'loaded' : ''} samples have
              geolocation co-ordinates.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SamplesMapByStudy;
