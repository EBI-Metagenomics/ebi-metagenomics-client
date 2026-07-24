import { Download } from '@/interfaces';
import { BGZipService } from 'components/Analysis/BgZipService';

type GffTrackOptions = {
  height?: number;
};

const createGffDisplay = (alias: string, height?: number) => ({
  type: 'LinearBasicDisplay' as const,
  displayId: `${alias}-LinearBasicDisplay`,
  ...(height ? { height } : {}),
});

export const createFastaAdapter = (fasta: Download) => {
  const faiUrl = BGZipService.getIndexFileUrl(fasta, 'fai');
  const gziUrl = BGZipService.getIndexFileUrl(fasta, 'gzi');

  if (gziUrl) {
    return {
      type: 'BgzipFastaAdapter' as const,
      fastaLocation: { uri: fasta.url },
      ...(faiUrl && { faiLocation: { uri: faiUrl } }),
      gziLocation: { uri: gziUrl },
    };
  }

  if (faiUrl) {
    return {
      type: 'IndexedFastaAdapter' as const,
      fastaLocation: { uri: fasta.url },
      faiLocation: { uri: faiUrl },
    };
  }

  return {
    type: 'UnindexedFastaAdapter' as const,
    fastaLocation: { uri: fasta.url },
  };
};

export const createGffAdapter = (gff: Download) => {
  const csiUrl = BGZipService.getIndexFileUrl(gff, 'csi');
  const tbiUrl = BGZipService.getIndexFileUrl(gff, 'tbi');
  const indexUrl = csiUrl || tbiUrl;

  if (indexUrl) {
    return {
      type: 'Gff3TabixAdapter' as const,
      gffGzLocation: { uri: gff.url },
      index: {
        location: { uri: indexUrl },
        indexType: csiUrl ? ('CSI' as const) : ('TBI' as const),
      },
    };
  }

  return {
    type: 'Gff3Adapter' as const,
    gffLocation: { uri: gff.url },
  };
};

export const createReferenceSequenceTrack = (fasta: Download) => ({
  type: 'ReferenceSequenceTrack' as const,
  trackId: 'refseq',
  adapter: createFastaAdapter(fasta),
});

export const createGffTrack = (
  gff: Download,
  assemblyName: string,
  options: GffTrackOptions = {}
) => ({
  type: 'FeatureTrack' as const,
  trackId: gff.alias,
  name: gff.alias,
  assemblyNames: [assemblyName],
  adapter: createGffAdapter(gff),
  displays: [createGffDisplay(gff.alias, options.height)],
});
