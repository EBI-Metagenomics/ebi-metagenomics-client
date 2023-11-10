import { ROCrate } from 'ro-crate';

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
  crate?: ROCrate;
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
