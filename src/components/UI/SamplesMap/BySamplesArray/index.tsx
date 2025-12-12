import React, { useContext } from 'react';

import { Wrapper } from '@googlemaps/react-wrapper';

import UserContext from 'pages/Login/UserContext';
import SamplesMap from 'components/UI/SamplesMap';
import render from '../render';

import '../style.css';
import { SampleDetail, Study } from '@/interfaces';

type SamplesMapProps = {
  study: Study;
  samples: SampleDetail[];
};
const SamplesMapBySamplesArray: React.FC<SamplesMapProps> = ({
  study,
  samples,
}) => {
  const { config } = useContext(UserContext);

  const samplesFiltered = samples.filter((sample) => {
    try {
      return (
        Number(sample?.metadata?.longitude) !== 0.0 &&
        Number(sample?.metadata?.latitude) !== 0.0
      );
    } catch {
      return false;
    }
  });

  return (
    <div className="mg-map-container">
      <div className="mg-map-wrapper">
        <Wrapper apiKey={config.googleMapsKey} render={render}>
          <SamplesMap study={study} samples={samplesFiltered} />
        </Wrapper>
      </div>
      <div className="mg-map-progress">
        {samplesFiltered.length === 0 && (
          <div>⚠️ None of the samples have geolocation co-ordinates.</div>
        )}
      </div>
    </div>
  );
};

export default SamplesMapBySamplesArray;
