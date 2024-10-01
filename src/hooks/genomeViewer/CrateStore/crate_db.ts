import Dexie, { Table } from 'dexie';
import { ROCrate } from 'ro-crate';
import { Track } from '@/utils/trackView';
import JSZip from 'jszip';

export interface StorableCrate {
  url: string;
  zipBlob: Blob;
  gff: string;
  schema: ROCrate;
  track: Track;
}

export interface Crate extends StorableCrate {
  zip?: JSZip;
  getHtmlContent?: (filename?: string) => Promise<string>;
  asciigff?: string;
}

export class ROCrateDB extends Dexie {
  crates!: Table<StorableCrate>;

  constructor() {
    super('ROCrateDB');
    this.version(1).stores({
      crates: 'url',
    });
  }
}

export const db = new ROCrateDB();
