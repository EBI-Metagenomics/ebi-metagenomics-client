import {
  db,
  Crate,
  StorableCrate,
  isOfflineCrate,
} from 'hooks/genomeViewer/CrateStore/crate_db';
import { useContext, useEffect, useState } from 'react';
import useMGnifyData from 'hooks/data/useMGnifyData';
import UserContext from 'pages/Login/UserContext';
import { MGnifyDatum } from 'hooks/data/useData';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';
import { Track } from 'utils/trackView';
import { useEffectOnce } from 'react-use';

const extractSchema = async (crateZip: JSZip): Promise<object> => {
  const metadataJsonFile = crateZip.file('ro-crate-metadata.json');
  if (!metadataJsonFile) {
    // TODO: toast or equivalent
    throw new Error('No metadata file found in crate');
  }
  const metadataJson = await metadataJsonFile.async('string');

  const metadata = JSON.parse(metadataJson);
  const trackCrate = new ROCrate(metadata, {
    link: true,
    array: true,
  });

  return trackCrate.getNormalizedTree();
};

const extractGffIfExists = async (
  crateZip: JSZip,
  schema: ROCrate
): Promise<string | undefined> => {
  let filePointer;
  schema.hasPart.forEach((dataset) => {
    if (
      dataset['@type'].includes('File') &&
      dataset.encodingFormat[0]['@value'].includes('gff')
    ) {
      filePointer = dataset['@id'];
    }
  });
  if (!filePointer) {
    return undefined;
  }
  if (!crateZip.file(filePointer)) {
    return undefined;
  }
  return crateZip.file(filePointer)?.async('base64');
};

const getTrackProperties = async (
  schema: ROCrate,
  crateURL: string,
  gff?: string
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

const getHTMLFile = async (
  zip: JSZip,
  filename?: string
): Promise<string | undefined> => {
  const htmlFile = filename || 'ro-crate-preview.html';
  return zip.file(htmlFile)?.async('string');
};

const hydrateStorableCrate = async (
  storableCrate: StorableCrate
): Promise<Crate> => {
  const crateZip: JSZip = await JSZip.loadAsync(storableCrate.zipBlob);
  if (!storableCrate.gff) return storableCrate;
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
  let gff: Maybe<string>;
  try {
    gff = await extractGffIfExists(crateZip, schema);
  } catch {
    // Just here to prevent breakage
  }
  const newCrate: StorableCrate = {
    url: crateURL,
    zipBlob,
    track: gff ? await getTrackProperties(schema, crateURL, gff) : undefined,
    schema,
    gff,
  };
  await db.crates.put(newCrate);
  return hydrateStorableCrate(newCrate);
};

// const fetchAndStoreCrate = async (crateURL: string): Promise<Crate> => {
//   const crate = await fetch(crateURL);
//   const zipBlob = await crate.blob();
//   const crateZip = await JSZip.loadAsync(zipBlob);
//   const schema = await extractSchema(crateZip);
//   const gff = await extractGffIfExists(crateZip, schema);
//
//   const newCrate: StorableCrate = {
//     url: crateURL,
//     zipBlob,
//     gff,
//     track: gff ? await getTrackProperties(schema, gff, crateURL) : null,
//     schema,
//   };
//   await db.crates.put(newCrate);
//   return hydrateStorableCrate(newCrate);
// };

const getCrate = async (crateURL: string): Promise<Crate> => {
  let crate: Maybe<Crate> = await db.crates.get({ url: crateURL });
  if (crate) {
    crate = await hydrateStorableCrate(crate);
  } else {
    crate = await fetchAndStoreCrate(crateURL);
  }
  return crate;
};

const getOfflineCrate = async (): Promise<Maybe<Crate>> => {
  let crate: Crate | undefined = await db.crates.filter(isOfflineCrate).first();
  if (crate) {
    crate = await hydrateStorableCrate(crate);
  }
  return crate;
};

export const useCrate = (crateURL: string): Maybe<Crate> => {
  const [crate, setCrate] = useState<Maybe<Crate>>();

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

export const useOfflineCrate = () => {
  const [crate, setCrate] = useState<Crate>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffectOnce(() => {
    getOfflineCrate().then(setCrate);
  });

  const uploadCrate = async (file: File) => {
    setIsUploading(true);
    setError(undefined);

    try {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const zipBlob = new Blob([event.target?.result as string]);
        const crateZip = await JSZip.loadAsync(zipBlob);
        const schema = await extractSchema(crateZip);
        const gff = await extractGffIfExists(crateZip, schema);

        const newCrate = {
          url: `file:///${file.name}`,
          zipBlob,
          gff,
          track: await getTrackProperties(schema, `file:///${file.name}`, gff),
          schema,
        };

        await db.crates.put(newCrate);
        const hydratedCrate = await hydrateStorableCrate(newCrate);
        setCrate(hydratedCrate);
        window.location.reload();
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeCrate = async () => {
    await db.crates.filter(isOfflineCrate).delete();
    setCrate(undefined);
    window.location.reload();
  };

  return {
    crate,
    uploadCrate,
    isUploading,
    error,
    removeCrate,
  };
};
