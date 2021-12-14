import Dexie, { Table } from 'dexie';

export interface GFF {
  id?: number;
  name: string;
  size: number;
  encodedGFF: string;
  added: Date;
}

export class GFFDb extends Dexie {
  gffs!: Table<GFF>;

  constructor() {
    super('emgGFF');
    this.version(1).stores({
      gffs: '++id, name',
    });
  }
}

export const db = new GFFDb();

export async function encodeGFF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      resolve(btoa(text as string));
    };
    reader.readAsText(file);
  });
}
