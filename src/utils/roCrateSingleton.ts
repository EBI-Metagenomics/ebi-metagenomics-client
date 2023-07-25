import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';

const RoCrateSingleton = (() => {
  let trackProperties = null;
  let trackPropertiesURL = null;
  let trackCrate = null;
  let previewHtml = null;
  let currentCrateUrl = null;
  let specifiedCrateFolder = null;

  const determineFilePath = (fileName) => {
    return specifiedCrateFolder
      ? `${specifiedCrateFolder}/${fileName}`
      : fileName;
  };

  const extractDetailsFromCrateZip = async (crateUrl) => {
    currentCrateUrl = crateUrl;
    try {
      const response = await fetch(crateUrl);
      if (response.status === 200 || response.status === 0) {
        const blob = await response.blob();
        const crateZip = await JSZip.loadAsync(blob);
        const metadataJson = await crateZip
          .file(determineFilePath('ro-crate-metadata.json'))
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
        const gff = await crateZip
          .file(determineFilePath(filePointer))
          .async('base64');
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
        trackProperties = trackAttributes;
        trackPropertiesURL = trackAttributes.url;
        trackCrate = crate;
        previewHtml = await crateZip
          .file(determineFilePath('ro-crate-preview.html'))
          .async('string');
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching RO crate:', error);
    }
  };

  const getTrackProperties = async (crateUrl) => {
    if (!trackProperties) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return trackProperties;
  };

  const getTrackPropertiesURL = async (crateUrl) => {
    if (!trackPropertiesURL) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return trackPropertiesURL;
  };

  const getTrackCrate = async (crateUrl) => {
    if (!trackCrate) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return trackCrate;
  };

  const getPreviewHtml = async (crateUrl, specificCrateFolder = null) => {
    specifiedCrateFolder = specificCrateFolder;
    if (!previewHtml || currentCrateUrl !== crateUrl) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return previewHtml;
  };

  return {
    getTrackProperties,
    getTrackPropertiesURL,
    getTrackCrate,
    getPreviewHtml,
  };
})();

export default RoCrateSingleton;
