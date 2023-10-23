import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
// import N3 from 'rdf-parser-n3';
import axios from 'axios';

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

  const fetchPolygonCoordinates = async () => {
    try {
      const response = await axios.get(
        `https://marineregions.org/rest/getGazetteerGeometries.ttl/${samples[0].attributes.mrgid}/`
        // `https://marineregions.org/rest/getGazetteerGeometries.ttl/${8348}/`
        // `https://marineregions.org/rest/getGazetteerGeometries.ttl/${8337}/`
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

      // const internalCoordinates = [];

      const coordinatesArray = [];
      const internalCoordinates = [];

      const pairs = polygonCoordinatesString.split(',');

      // const sub = str.substring(str.indexOf('(') + 1, str.indexOf(')'));

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        // if (pair.includes('(') || pair.includes(')')) {
        if (pair.includes('(')) {
          console.log('i', pair);
          // find index of pair in polygonCoordinatesString
          const indexOfPair = polygonCoordinatesString.indexOf(pair);
          const indexOfPairEnd = polygonCoordinatesString.indexOf(`${pair})`);
          // console.log('indexOfPairEnd', indexOfPairEnd);
          const internalCoordinatesString = polygonCoordinatesString.substring(
            polygonCoordinatesString.indexOf(pair),
            // polygonCoordinatesString.indexOf(')')
            indexOfPairEnd + pair.length
          );

          // const internalCoordinatesString = polygonCoordinatesString.substring(
          //   pair.indexOf('(') + 1,
          //   pair.indexOf(')')
          // );
          internalCoordinates.push(internalCoordinatesString);
          // make i skip to the end of the internal coordinates
          i += internalCoordinatesString.split(' ').length - 1;

          // continue;
          // coordinatesArray.push(null);
        } else {
          const [lng, lat] = pair.trim().split(' ').map(parseFloat);
          coordinatesArray.push({ lat, lng });
        }
      }

      // .filter((pair) => pair !== null);
      // console.log('internal', internalCoordinates);
      // console.log(coordinatesArray);
      return coordinatesArray;
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
    }
  };

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
        samples[0].relationships.biome.data.id.includes(
          'root:Environmental:Aquatic'
        )
      ) {
        fetchPolygonCoordinates().then((coordinates) => {
          drawPolygon(coordinates);
        });
      }
    }
  }, [theMap, samples]);

  return <div ref={ref} id="map" style={{ height: '100%' }} />;
};

export default SamplesMap;
