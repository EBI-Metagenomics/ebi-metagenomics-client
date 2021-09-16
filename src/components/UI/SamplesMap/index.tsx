import React, { useEffect, useRef, useState, ReactElement } from 'react';
import ReactDOMServer from 'react-dom/server';
// import { Link } from 'react-router-dom';

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

// TODO: make the link play nicer with react-router
const MarkerPopup: React.FC<{ sample: MGnifyDatum }> = ({ sample }) => (
  <div className="vf-box vf-box--easy">
    <h3 className="vf-box__heading">
      <a href={`../samples/${sample.id}`}>{sample.id}</a>
      {/* <Link to="/search/studies">{sample.id}</Link> */}
    </h3>
    <p className="vf-box__text">{sample.attributes['sample-desc']}</p>
  </div>
);
const ClusterMarkerPopup: React.FC<{ accessions: string[] }> = ({
  accessions,
}) => (
  <div className="vf-box vf-box--easy">
    <h3 className="vf-box__heading">Samples on this geographical location</h3>
    <ul className="vf-list">
      {accessions.map((accession) => (
        <li ref={accession}>
          <a href={`../samples/${accession}`}>{accession}</a>
        </li>
      ))}
    </ul>
  </div>
);

type MapProps = {
  data: Array<MGnifyDatum>;
};
const MyMapComponent: React.FC<MapProps> = ({ data }) => {
  const ref = useRef();
  const [theMap, setTheMap] = useState(null);
  const markerCluster = useRef<MarkerClusterer>(null);
  const sampleInfoWindow = useRef(new google.maps.InfoWindow());
  const clusterInfoWindow = useRef(new google.maps.InfoWindow());
  const newBoundary = useRef(new google.maps.LatLngBounds());

  const markers = useRef({});

  useEffect(() => {
    if (theMap === null) {
      const tmpMap = new google.maps.Map(ref.current, {
        maxZoom: 10,
        minZoom: 2,
      });
      setTheMap(tmpMap);
    }
  }, [theMap]);
  useEffect(() => {
    if (theMap && data) {
      if (markerCluster.current) {
        markerCluster.current.clearMarkers();
      }

      data
        .filter(({ id }) => !(id in markers.current))
        .forEach((sample) => {
          const position = {
            lat: sample.attributes.latitude as number,
            lng: sample.attributes.longitude as number,
          };
          const marker = new google.maps.Marker({
            position,
            title: sample.id,
          });
          newBoundary.current.extend(position);
          marker.addListener('click', () => {
            sampleInfoWindow.current.setContent(
              ReactDOMServer.renderToString(<MarkerPopup sample={sample} />)
            );
            sampleInfoWindow.current.open(theMap, marker);
          });
          markers.current[sample.id] = marker;
        });
      markerCluster.current = new MarkerClusterer(
        theMap,
        Object.values(markers.current),
        {
          imagePath:
            'https://googlemaps.github.io/js-markerclustererplus/images/m',
          maxZoom: 10,
        }
      );

      // for clusters in MAX Zoom and with less than 10 elements show a list
      google.maps.event.addListener(
        markerCluster.current,
        'click',
        // eslint-disable-next-line func-names
        function (cluster) {
          if (
            // eslint-disable-next-line no-underscore-dangle, react/no-this-in-sfc
            this.prevZoom_ + 1 <= this.getMaxZoom() ||
            cluster.getSize() >= 10
          ) {
            return;
          }
          clusterInfoWindow.current.setPosition(cluster.getCenter());

          clusterInfoWindow.current.setContent(
            ReactDOMServer.renderToString(
              <ClusterMarkerPopup
                accessions={cluster.getMarkers().map((m) => m.getTitle())}
              />
            )
          );

          clusterInfoWindow.current.open(theMap);
        }
      );

      theMap.fitBounds(newBoundary.current);
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

export default SamplesMap;
