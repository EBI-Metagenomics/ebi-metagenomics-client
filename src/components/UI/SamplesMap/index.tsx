import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';

import MarkerClusterer from '@googlemaps/markerclustererplus';

import './style.css';
import LoadingDots from 'components/UI/LoadingDots';
import { SampleDetail, Study, StudySample } from '@/interfaces';

// TODO: make the link play nicer with react-router
const MarkerPopup: React.FC<{ sample: StudySample }> = ({ sample }) => (
  <div className="vf-box vf-box--easy">
    <h3 className="vf-box__heading">
      <a href={`../samples/${sample.accession}`}>{sample.accession}</a>
    </h3>
    <p className="vf-box__text">{sample?.metadata?.sample_description}</p>
  </div>
);
const ClusterMarkerPopup: React.FC<{ accessions: string[] }> = ({
  accessions,
}) => (
  <div className="vf-box vf-box--easy">
    <h3 className="vf-box__heading">Samples on this geographical location</h3>
    <ul className="vf-list">
      {accessions.map((accession) => (
        <li ref={accession} key={accession}>
          <a href={`../samples/${accession}`}>{accession}</a>
        </li>
      ))}
    </ul>
  </div>
);

type MapProps = {
  study: Study;
  samples: Array<StudySample | SampleDetail>;
};

const SamplesMap: React.FC<MapProps> = ({ study, samples }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [theMap, setTheMap] = useState<google.maps.Map>();
  const markerCluster = useRef<MarkerClusterer>();
  const sampleInfoWindow = useRef(new google.maps.InfoWindow());
  const clusterInfoWindow = useRef(new google.maps.InfoWindow());
  const newBoundary = useRef(new google.maps.LatLngBounds());
  const markers = useRef({});
  const [markingEezRegions, setMarkingEezRegions] = useState(false);

  const fetchPolygonCoordinates = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://marineregions.org/rest/getGazetteerGeometries.ttl/${samples[0]?.mrgid}/`
      );
      const rdfData = response.data as unknown as string;
      let polygonCoordinatesString = rdfData.substring(
        rdfData.indexOf('((') + 2,
        rdfData.indexOf('))')
      );

      const coordinatesArray: { lat: number; lng: number }[] = [];

      const pairs = polygonCoordinatesString.split(',');

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.includes('(')) {
          const indexOfPairEnd = polygonCoordinatesString.indexOf(`${pair})`);
          const internalCoordinatesString = polygonCoordinatesString.substring(
            polygonCoordinatesString.indexOf(pair),
            indexOfPairEnd + pair.length
          );
          i += internalCoordinatesString.split(' ').length - 1;
        } else {
          const [lng, lat] = pair.trim().split(' ').map(parseFloat);
          coordinatesArray.push({ lat, lng });
        }
      }
      return coordinatesArray;
    } catch {
      // markingEezRegions.current = false;
    }
  }, [samples]);

  const drawPolygon = useCallback(
    (
      coordinates: google.maps.LatLngLiteral[] | { lat: number; lng: number }[]
    ) => {
      if (!theMap) return;
      const polygon = new google.maps.Polygon({
        paths: coordinates as google.maps.LatLngLiteral[],
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.35,
      });
      polygon.setMap(theMap);
    },
    [theMap]
  );

  useEffect(() => {
    if (!theMap && ref.current) {
      const tmpMap = new google.maps.Map(ref.current, {
        // zoom: 0.1,
        maxZoom: 5,
        minZoom: 2,
      });
      setTheMap(tmpMap);
    }
  }, [theMap]);

  useEffect(() => {
    console.log('samples or map changed', theMap, samples);
    if (theMap && samples) {
      console.log(samples);
      if (markerCluster.current) {
        markerCluster.current.clearMarkers();
      }

      samples
        // .filter(({ accession }) => !(accession in markers.current))
        .forEach((sample) => {
          const position = {
            lat: Number(sample?.metadata?.lat),
            lng: Number(sample?.metadata?.lon),
          };
          console.log(position);
          const marker = new google.maps.Marker({
            position,
            title: sample.accession,
          });
          newBoundary.current.extend(position);
          marker.addListener('click', () => {
            sampleInfoWindow.current.setContent(
              ReactDOMServer.renderToString(<MarkerPopup sample={sample} />)
            );
            sampleInfoWindow.current.open(theMap, marker);
          });
          markers.current[sample.accession] = marker;
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

        function (cluster) {
          if (
            // @ts-ignore
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

      // TODO: check EEZs
      if (
        samples[0]?.mrgid &&
        study.biome.lineage?.includes('root:Environmental:Aquatic')
      ) {
        setMarkingEezRegions(true);
        fetchPolygonCoordinates().then((coordinates) => {
          drawPolygon(coordinates);
          setMarkingEezRegions(false);
        });
      }
    }
  }, [
    theMap,
    samples,
    study.biome.lineage,
    fetchPolygonCoordinates,
    drawPolygon,
  ]);

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
