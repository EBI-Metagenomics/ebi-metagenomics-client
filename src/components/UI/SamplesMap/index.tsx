import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';

import MarkerClusterer from '@googlemaps/markerclustererplus';

import { MGnifyDatum } from '@/hooks/data/useData';

import './style.css';
import LoadingDots from 'components/UI/LoadingDots';

// TODO: make the link play nicer with react-router
const MarkerPopup: React.FC<{ sample: MGnifyDatum }> = ({ sample }) => (
  <div className="vf-box vf-box--easy">
    <h3 className="vf-box__heading">
      <a href={`../samples/${sample.id}`}>{sample.id}</a>
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
  const [markingEezRegions, setMarkingEezRegions] = useState(false);

  // eslint-disable-next-line consistent-return,react-hooks/exhaustive-deps
  const fetchPolygonCoordinates = async () => {
    try {
      const response = await axios.get(
        `https://marineregions.org/rest/getGazetteerGeometries.ttl/${samples[0].attributes.mrgid}/`
      );
      const rdfData = response.data as unknown as string;
      let polygonCoordinatesString = rdfData.substring(
        rdfData.indexOf('POLYGON') + 8,
        rdfData.length - 3
      );
      polygonCoordinatesString = rdfData.substring(
        rdfData.indexOf('((') + 2,
        rdfData.indexOf('))')
      );

      const coordinatesArray = [];
      const internalCoordinates = [];

      const pairs = polygonCoordinatesString.split(',');

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.includes('(')) {
          const indexOfPairEnd = polygonCoordinatesString.indexOf(`${pair})`);
          const internalCoordinatesString = polygonCoordinatesString.substring(
            polygonCoordinatesString.indexOf(pair),
            indexOfPairEnd + pair.length
          );

          internalCoordinates.push(internalCoordinatesString);
          i += internalCoordinatesString.split(' ').length - 1;
        } else {
          const [lng, lat] = pair.trim().split(' ').map(parseFloat);
          coordinatesArray.push({ lat, lng });
        }
      }
      return coordinatesArray;
    } catch (err) {
      // markingEezRegions.current = false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drawPolygon = (coordinates) => {
    if (!theMap) return;
    const polygon = new google.maps.Polygon({
      paths: coordinates,
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
    });
    polygon.setMap(theMap);
  };

  useEffect(() => {
    if (theMap === null) {
      const tmpMap = new google.maps.Map(ref.current, {
        // zoom: 0.1,
        maxZoom: 5,
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

      if (
        samples[0]?.attributes?.mrgid &&
        samples[0]?.relationships?.biome?.data?.id?.includes(
          'root:Environmental:Aquatic'
        )
      ) {
        setMarkingEezRegions(true);
        fetchPolygonCoordinates().then((coordinates) => {
          drawPolygon(coordinates);
          setMarkingEezRegions(false);
        });
      }
    }
  }, [theMap, samples, fetchPolygonCoordinates, drawPolygon]);

  return (
    <>
      {markingEezRegions && (
        <span>
          Marking EEZ regions
          <LoadingDots />
        </span>
      )}
      <div ref={ref} id="map" style={{ height: '100%' }} />
    </>
  );
};

export default SamplesMap;
