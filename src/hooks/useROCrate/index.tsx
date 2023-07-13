import { useEffect, useState, useRef } from 'react';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate/index';

function useROCrate(crateUrl) {
  const trackProperties = useRef(null);
  const trackPropertiesURL = useRef(null);
  const trackCrate = useRef(null);
  const previewHtml = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch(crateUrl);
      if (response.status === 200 || response.status === 0) {
        const blob = await response.blob();
        const crateZip = await JSZip.loadAsync(blob);
        const metadataJson = await crateZip
          .file('ro-crate-metadata.json')
          .async('string');

        const metadata = JSON.parse(metadataJson);
        const crate = new ROCrate(metadata, {
          link: true,
          array: true,
        });
        const tree = crate.getNormalizedTree();
        let filePointer;
        tree.hasPart.forEach((dataset) => {
          if (
            dataset['@type'].includes('File') &&
            dataset.encodingFormat[0]['@value'].includes('gff')
          ) {
            filePointer = dataset['@id'];
          }
        });
        const name = tree.name[0]['@value'].split(' ')[0];
        const gff = await crateZip.file(filePointer).async('base64');
        const trackAttributes = {
          name,
          type: 'annotation',
          format: 'gff3',
          displayMode: 'EXPANDED',
          url: `data:application/octet-stream;base64,${gff}`,
          label: name,
          crate: {
            tree,
            zip: crateZip,
          },
        };
        trackProperties.current = trackAttributes;
        trackPropertiesURL.current = trackAttributes.url;
        trackCrate.current = crate;

        const previewHtmlContent = await crateZip
          .file('ro-crate-preview.html')
          .async('string');
        previewHtml.current = previewHtmlContent;
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error('Error fetching RO crate:', error);
    }
  };

  const getTrackProperties = async () => {
    if (!trackProperties.current) {
      await fetchData();
    }
    return trackProperties.current;
  };

  const getTrackPropertiesURL = async () => {
    if (!trackPropertiesURL.current) {
      await fetchData();
    }
    return trackPropertiesURL.current;
  };

  const getTrackCrate = async () => {
    if (!trackCrate.current) {
      await fetchData();
    }
    return trackCrate.current;
  };

  const getPreviewHtml = async () => {
    if (!previewHtml.current) {
      await fetchData();
    }
    return previewHtml.current;
  };

  return {
    getTrackProperties,
    getTrackPropertiesURL,
    getTrackCrate,
    getPreviewHtml,
  };
}

export default useROCrate;
