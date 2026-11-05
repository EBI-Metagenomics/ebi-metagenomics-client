// Normalized JSON data stored in IndexedDB, rather than a ROCrate instance.
export type CrateSchema = {
  name: { '@value': string }[];
  hasPart: {
    '@id': string;
    '@type': string[];
    encodingFormat: { '@value': string }[];
  }[];
};

export type Track = {
  name: string;
  type?:
    | 'annotation'
    | 'wig'
    | 'alignment'
    | 'variant'
    | 'seg'
    | 'mut'
    | 'interact'
    | 'gwas'
    | 'arc'
    | 'junction';
  format?:
    | 'gff3'
    | 'gff'
    | 'gtf'
    | 'bed'
    | 'bedpe'
    | 'wig'
    | 'bigWig'
    | 'bedGraph'
    | 'bam'
    | 'cram'
    | 'vcf'
    | 'seg'
    | 'maf'
    | 'mut'
    | 'interact'
    | 'bigInteract'
    | 'gwas'
    | 'bp';
  url?: string;
  indexed?: boolean;
  displayMode?: 'EXPANDED' | 'COLLAPSED' | 'SQUISHED';
  crate?: { schema: CrateSchema } | null;
  initialCrateURL?: string;
  label?: string;
};

export type TrackView = {
  id: string;
  track: {
    id: string;
    config: Track;
  };
};
