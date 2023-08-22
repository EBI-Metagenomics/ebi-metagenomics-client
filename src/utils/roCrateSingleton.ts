import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';

const RoCrateSingleton = (() => {
  let trackProperties = null;
  let trackPropertiesURL = null;
  let trackCrate = null;
  let trackCrateZip = null;
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
      if (response.status === 200) {
        const blob = await response.blob();
        const crateZip = await JSZip.loadAsync(blob);
        trackCrateZip = crateZip;
        const metadataJson = await crateZip
          .file(determineFilePath('ro-crate-metadata.json'))
          .async('string');
        const metadata = JSON.parse(metadataJson);
        trackCrate = new ROCrate(metadata, {
          link: true,
          array: true,
        });
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching RO crate:', error);
    }
  };

  const getTrackProperties = async (crateUrl) => {
    if (!trackProperties || currentCrateUrl !== crateUrl || !trackCrate) {
      await extractDetailsFromCrateZip(crateUrl);
      const tree = trackCrate.getNormalizedTree();
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
      const gff = await trackCrateZip
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
          zip: trackCrateZip,
        },
      };
      trackProperties = trackAttributes;
      trackPropertiesURL = trackAttributes.url;
    }
    return trackProperties;
  };

  const getTrackPropertiesURL = async (crateUrl) => {
    if (!trackPropertiesURL) {
      await extractDetailsFromCrateZip(crateUrl);
      await getTrackProperties(crateUrl);
    }
    return trackPropertiesURL;
  };

  const getTrackCrate = async (crateUrl) => {
    if (!trackCrate) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return trackCrate;
  };

  const getHtmlContent = async (
    fileName,
    crateUrl,
    specificCrateFolder = null
  ) => {
    specifiedCrateFolder = specificCrateFolder;
    if (currentCrateUrl !== crateUrl) {
      await extractDetailsFromCrateZip(crateUrl);
    }
    return trackCrateZip.file(determineFilePath(fileName)).async('string');
  };

  return {
    getTrackProperties,
    getTrackPropertiesURL,
    getTrackCrate,
    getHtmlContent,
  };
})();

export default RoCrateSingleton;
