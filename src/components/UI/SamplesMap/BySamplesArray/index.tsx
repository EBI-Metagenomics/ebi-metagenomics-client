import React, { useContext } from 'react';

import { Wrapper } from '@googlemaps/react-wrapper';

import UserContext from '@/pages/Login/UserContext';
import SamplesMap from 'components/UI/SamplesMap';
import { MGnifyDatum } from '@/hooks/data/useData';
import render from '../render';

import '../style.css';

type SamplesMapProps = {
  samples: Array<MGnifyDatum>;
};
const SamplesMapBySamplesArray: React.FC<SamplesMapProps> = ({ samples }) => {
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
      <div className="mg-map-progress">
        {samplesFiltered.length === 0 && (
          <div>⚠️ None of the samples have geolocation co-ordinates.</div>
        )}
      </div>
    </div>
  );
};

export default SamplesMapBySamplesArray;
