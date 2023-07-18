import { useRef } from 'react';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';

function useROCrate(crateUrl) {
  const trackProperties = useRef(null);
  const trackPropertiesURL = useRef(null);
  const trackCrate = useRef(null);
  const previewHtml = useRef(null);

  const extractDetailsFromCrateZip = async () => {
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
          initialCrateUrl: crateUrl,
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

        previewHtml.current = await crateZip
          .file('ro-crate-preview.html')
          .async('string');
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error('Error fetching RO crate:', error);
    }
  };

  const getTrackProperties = async (givenCrateUrl) => {
    crateUrl = givenCrateUrl;
    if (!trackProperties.current) {
      await extractDetailsFromCrateZip();
    }
    return trackProperties.current;
  };

  const getTrackPropertiesURL = async () => {
    if (!trackPropertiesURL.current) {
      await extractDetailsFromCrateZip();
    }
    return trackPropertiesURL.current;
  };

  const getTrackCrate = async () => {
    if (!trackCrate.current) {
      await extractDetailsFromCrateZip();
    }
    return trackCrate.current;
  };

  const getPreviewHtml = async () => {
    if (!previewHtml.current) {
      await extractDetailsFromCrateZip();
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
