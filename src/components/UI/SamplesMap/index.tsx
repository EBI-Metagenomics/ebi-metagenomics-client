import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';

import MarkerClusterer from '@googlemaps/markerclustererplus';

import { MGnifyDatum } from 'hooks/data/useData';

import './style.css';

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
  samples: Array<MGnifyDatum>;
};

const SamplesMap: React.FC<MapProps> = ({ samples }) => {
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
    if (theMap && samples) {
      if (markerCluster.current) {
        markerCluster.current.clearMarkers();
      }

      samples
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
            'https://raw.githubusercontent.com/googlemaps/js-markerclustererplus/master/images/m',
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
  }, [theMap, samples]);

  return <div ref={ref} id="map" style={{ height: '100%' }} />;
};

export default SamplesMap;
