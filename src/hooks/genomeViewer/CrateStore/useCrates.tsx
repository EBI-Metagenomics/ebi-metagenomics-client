import {
  db,
  Crate,
  StorableCrate,
} from 'hooks/genomeViewer/CrateStore/crate_db';
import { useContext, useEffect, useState } from 'react';
import useMGnifyData from 'hooks/data/useMGnifyData';
import UserContext from 'pages/Login/UserContext';
import { MGnifyDatum } from 'hooks/data/useData';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';
import { Track } from 'utils/trackView';

const extractSchema = async (crateZip: JSZip): Promise<object> => {
  const metadataJson = await crateZip
    .file('ro-crate-metadata.json')
    .async('string');

  const metadata = JSON.parse(metadataJson);
  const trackCrate = new ROCrate(metadata, {
    link: true,
    array: true,
  });

  return trackCrate.getNormalizedTree();
};

const extractGff = async (
  crateZip: JSZip,
  schema: ROCrate
): Promise<string> => {
  let filePointer;
  schema.hasPart.forEach((dataset) => {
    if (
      dataset['@type'].includes('File') &&
      dataset.encodingFormat[0]['@value'].includes('gff')
    ) {
      filePointer = dataset['@id'];
    }
  });
  return crateZip.file(filePointer).async('base64');
};

const getTrackProperties = async (
  schema: ROCrate,
  gff: string,
  crateURL: string
): Promise<Track> => {
  const name = schema.name[0]['@value'].split(' ')[0];
  return {
    name,
    type: 'annotation',
    format: 'gff3',
    displayMode: 'EXPANDED',
    label: name,
    url: `data:application/octet-stream;base64,${gff}`,
    initialCrateURL: crateURL,
    crate: {
      schema,
    },
  };
};

const getHTMLFile = async (zip: JSZip, filename?: string): Promise<string> => {
  const htmlFile = filename || 'ro-crate-preview.html';
  return zip.file(htmlFile).async('string');
};

const hydrateStorableCrate = async (
  storableCrate: StorableCrate
): Promise<Crate> => {
  const crateZip: JSZip = await JSZip.loadAsync(storableCrate.zipBlob);
  return {
    ...storableCrate,
    zip: crateZip,
    getHtmlContent: (filename) => getHTMLFile(crateZip, filename),
    asciigff: atob(storableCrate.gff),
  };
};

const fetchAndStoreCrate = async (crateURL: string): Promise<Crate> => {
  const crate = await fetch(crateURL);
  const zipBlob = await crate.blob();
  const crateZip = await JSZip.loadAsync(zipBlob);
  const schema = await extractSchema(crateZip);
  const gff = await extractGff(crateZip, schema);

  const newCrate: StorableCrate = {
    url: crateURL,
    zipBlob,
    gff,
    track: await getTrackProperties(schema, gff, crateURL),
    schema,
  };
  await db.crates.put(newCrate);
  return hydrateStorableCrate(newCrate);
};

const getCrate = async (crateURL: string): Promise<Crate> => {
  let crate: Crate = await db.crates.get({ url: crateURL });
  if (crate) {
    crate = await hydrateStorableCrate(crate);
  } else {
    crate = await fetchAndStoreCrate(crateURL);
  }
  return crate;
};

export const useCrate = (crateURL: string): Crate => {
  const [crate, setCrate] = useState(null);

  useEffect(() => {
    if (!crateURL) return;
    getCrate(crateURL).then(setCrate);
  }, [crateURL]);

  return crate;
};

export interface Crates {
  crates: Crate[];
  loading: boolean;
}

export const useCrates = (associatedCratesUrl: string): Crates => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { config } = useContext(UserContext);

  const endpoint = associatedCratesUrl.startsWith(config.api)
    ? associatedCratesUrl.replace(config.api, '')
    : associatedCratesUrl;

  const { data, loading } = useMGnifyData(endpoint);

  useEffect(() => {
    if (loading) return;
    Promise.all(
      (data.data as MGnifyDatum[]).map((crateItem) =>
        getCrate(crateItem.links.self as string)
      )
    )
      .then((newCrates) => {
        setCrates(newCrates);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [data, loading]);

  return {
    crates,
    loading: isLoading,
  };
};
