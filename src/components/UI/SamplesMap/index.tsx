import React, { useEffect, useRef, useState, ReactElement } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import MarkerClusterer from '@googlemaps/markerclustererplus';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useSamplesProvider from 'hooks/data/useSamplesProvider';
import { ErrorTypes, MGnifyDatum } from 'hooks/data/useData';

import './style.css';
import config from 'config.json';

const LIMIT = 200;

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <Loading />;
  if (status === Status.FAILURE)
    return (
      <FetchError
        error={{
          status: 200,
          type: ErrorTypes.OtherError,
          error: status,
        }}
      />
    );
  return null;
};

type MapProps = {
  data: Array<MGnifyDatum>;
};
const MyMapComponent: React.FC<MapProps> = ({ data }) => {
  const ref = useRef();
  const [theMap, setTheMap] = useState(null);
  const sampleInfoWindow = new google.maps.InfoWindow();

  const markers = {};
  let markerCluster: MarkerClusterer = null;

  useEffect(() => {
    if (theMap === null) {
      const tmpMap = new google.maps.Map(ref.current, {
        maxZoom: 10,
      });
      setTheMap(tmpMap);
    }
  }, []);
  useEffect(() => {
    if (theMap && data) {
      if (markerCluster) {
        markerCluster.clearMarkers();
      }
      const newBoundary = new google.maps.LatLngBounds();

      data
        .filter(({ id }) => !(id in markers))
        .forEach((sample) => {
          const position = {
            lat: sample.attributes.latitude as number,
            lng: sample.attributes.longitude as number,
          };
          const marker = new google.maps.Marker({
            position,
          });
          newBoundary.extend(position);
          marker.addListener('click', () => {
            sampleInfoWindow.setContent(
              // TODO: ⚠️ get the content of the Info window
              'new SamplePopUpView(sample).render().el'
            );
            sampleInfoWindow.open(theMap, marker);
          });
          markers[sample.id] = marker;
        });
      markerCluster = new MarkerClusterer(theMap, Object.values(markers), {
        imagePath:
          'https://googlemaps.github.io/js-markerclustererplus/images/m',
        maxZoom: 18,
      });
      // TODO: ⚠️ for clusters in MAX Zoom and with less than 10 elements show a list
      theMap.fitBounds(newBoundary);
    }
  }, [theMap, data]);

  return <div ref={ref} id="map" style={{ height: '100%' }} />;
};

type SamplesMapProps = {
  study: string;
};
const SamplesMap: React.FC<SamplesMapProps> = ({ study }) => {
  const [limit, setLimit] = useState(LIMIT);
  const { samples, total } = useSamplesProvider(study, limit);
  const samplesFiltered = samples.filter((sample) => {
    if (
      sample.attributes &&
      'longitude' in sample.attributes &&
      'latitude' in sample.attributes
    ) {
      return (
        sample.attributes.longitude !== 0.0 &&
        sample.attributes.latitude !== 0.0
      );
    }
    return false;
  });

  return (
    <div className="mg-map-container">
      <div className="mg-map-wrapper">
        <Wrapper apiKey={config.googleMapsKey} render={render}>
          <MyMapComponent data={samplesFiltered} />
        </Wrapper>
      </div>
      {total && (
        <div className="mg-map-progress">
          <progress max={total} value={samplesFiltered.length} />
          {total > limit && (
            <div>
              We are only loading the first {LIMIT} samples. Click{' '}
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
        </div>
      )}
    </div>
  );
};

export default SamplesMap;
