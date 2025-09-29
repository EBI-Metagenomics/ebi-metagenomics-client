import Dexie, { Table } from 'dexie';
import * as Comlink from 'comlink';
import { filter, flatMap, forIn, groupBy, map, uniq } from 'lodash-es';
import { RemoteFile } from 'generic-filehandle2';
import { BgzipIndexedFasta } from '@gmod/indexedfasta';

export type ContigDetails = {
  contigName: string;
  length: number;
  annotations: {
    interpros?: string[];
    pfams?: string[];
    cogs?: string[];
    keggs?: string[];
    gos?: string[];
  };
  annotationsPresence: {
    hasInterpros?: number;
    hasPfams?: number;
    hasCogs?: number;
    hasKeggs?: number;
    hasGos?: number;
  };
};

export type Contig = ContigDetails & {
  contigId: number;
};

type MetaKeys = 'assemblyAccession' | 'importStartedAt' | 'sourceUrl';

export function contigNameToContigId(contigName: string): number {
  return parseInt(contigName.split('_')[1]);
}

class GffDB extends Dexie {
  contigs!: Table<Contig, number>;
  meta!: Table<{ key: MetaKeys; value: any }, string>;
  constructor(name = 'gffdb') {
    super(name);
    this.version(2).stores({
      contigs:
        'contigId, length, *annotations.interpros, *annotations.pfams, *annotations.cogs, *annotations.keggs, *annotations.gos, ' +
        'annotationsPresence.hasInterpros, annotationsPresence.hasPfams, annotationsPresence.hasCogs, ' +
        'annotationsPresence.hasKeggs, annotationsPresence.hasGos',
      //contigId is the primary key since named first - this is the contig integer index so that contigs
      // can be sorted by contig index rather than alphanumerically... contig 312 should be after contig 99.
      // The assembly key needs prepended to this to make a locus tag.
      meta: 'key',
    });
  }
}
export let db = new GffDB();

export async function resetDb() {
  await db.delete();
  db = new GffDB();
  await db.open();
  return db;
}

type WorkerApi = {
  /**
   * Streams + parses the GFF from server, and emits batches of rows from background thread
   */
  importGff: (
    url: string,
    indexUrl: string,
    onProgress: (bytes: number, total?: number) => void,
    onBatch: (rows: any[]) => Promise<void>,
    attrsToIndex: string[],
    batchSize?: number
  ) => Promise<void>;
};

function createWorker() {
  const worker = new Worker(
    new URL('./locallyIndexedGff.worker.ts', import.meta.url),
    { type: 'module' }
  );
  const api = Comlink.wrap<WorkerApi>(worker);
  return { worker, api };
}

export type ImportOptions = {
  url: string; // to get annots
  assemblyAccession: string;
  indexUrl: string; // to paginate gff
  fastaUrl?: string; // to get the length of each contig
  fastaFaiUrl?: string; // ^
  fastaGziUrl?: string; // ^
  attrsToIndex: string[]; // e.g. ['interpro', 'pfam', ...]
  batchSize?: number; // gff lines per indexing batch,
  // may be useful for performance tuning otherwise remove and rely on blockzip size as batch
  onProgress?: (info: {
    bytes: number;
    total?: number;
    percent?: number;
  }) => void;
  onBegin?: () => void;
  onEnd?: (summary: { seconds: number; contigsCount: number }) => void;
  onError?: (e: unknown) => void;
  clearExisting?: boolean; // default true - clear the DB before reindexing
};

export type TypeAheadAttributes =
  | 'interpros'
  | 'pfams'
  | 'keggs'
  | 'gos'
  | 'cogs';

export async function getTypeaheadSuggestions(
  query: string,
  attribute: TypeAheadAttributes,
  limit: number = 10
): Promise<string[]> {
  if (!query || query.length < 1) return [];

  try {
    const upperQuery = query.toUpperCase();

    // Get all unique attributes (e.g. interpros) that start with the query
    const suggestions = await db.contigs
      .where(`annotations.${attribute}`)
      .startsWithIgnoreCase(upperQuery)
      .limit(limit * 3) // Get more than needed to account for duplicates. *3 is a guess.
      .toArray();

    return suggestions
      .flatMap((contig) => contig.annotations[attribute] || [])
      .filter((attr) => (attr as string).toUpperCase().startsWith(upperQuery))
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort() // Sort alphabetically
      .slice(0, limit);
  } catch (error) {
    console.error(`Error fetching ${attribute} suggestions:`, error);
    return [];
  }
}

export function importGffToIndexedDB(opts: ImportOptions) {
  const {
    url,
    assemblyAccession,
    indexUrl,
    fastaUrl = undefined,
    fastaFaiUrl = undefined,
    fastaGziUrl = undefined,
    attrsToIndex,
    batchSize = 200,
    onProgress,
    onBegin,
    onEnd,
    onError,
    clearExisting = true,
  } = opts;
  // Ask for persistent storage (helps avoid eviction on large datasets)
  // Fire and forget; ignore if unsupported
  navigator.storage?.persist?.();

  const { worker, api } = createWorker();
  let startT = performance.now();
  let cancelled = false;

  const progressCb = Comlink.proxy((bytes: number, total?: number) => {
    onProgress?.({
      bytes,
      total,
      percent: total ? (bytes / total) * 100 : undefined,
    });
  });

  type contigUpsertDefinition = {
    contigId: Contig['contigId'];
    contigName: Contig['contigName'];
    length?: Contig['length'];
    annotsToAppend: Contig['annotations'];
  };

  async function bulkUpsertContigAnnotations(
    updates: contigUpsertDefinition[]
  ) {
    const merged = new Map<Contig['contigId'], ContigDetails>();
    for (const { contigId, annotsToAppend, contigName, length } of updates) {
      const acc =
        merged.get(contigId) ??
        ({
          contigName: contigName,
          length: length,
          annotations: {},
          annotationsPresence: {},
        } as ContigDetails);
      for (const [annotType, annotValues] of Object.entries(annotsToAppend)) {
        if (!Array.isArray(annotValues)) continue;
        const prev = (acc as any).annotations[annotType] as any[] | undefined;
        (acc as ContigDetails).annotations[annotType] = prev
          ? prev.concat(annotValues)
          : annotValues.slice();
      }
      merged.set(contigId, acc);
    }

    const ids = Array.from(merged.keys());

    await db.transaction('rw', db.contigs, async () => {
      const existing = await db.contigs.bulkGet(ids);
      const toUpdate: Contig[] = [];
      const toAdd: Contig[] = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const row = existing[i] as Contig | undefined;
        const appendObj = merged.get(id)!;

        if (row) {
          // Update: append + dedupe each annotation within nested annotations.*
          const next: Contig = {
            ...row,
            annotations: { ...(row.annotations || {}) },
          };
          for (const [field, vals] of Object.entries(appendObj.annotations)) {
            const current = (row.annotations as any)?.[field] as
              | any[]
              | undefined;
            (next.annotations as any)[field] = uniq([
              ...(current ?? []),
              ...(vals as any[]),
            ]);
          }
          // compute presence flags (length > 0)
          (next as any).annotationsPresence = {
            hasInterpros: (next.annotations.interpros?.length ?? 0) > 0 ? 1 : 0,
            hasPfams: (next.annotations.pfams?.length ?? 0) > 0 ? 1 : 0,
            hasCogs: (next.annotations.cogs?.length ?? 0) > 0 ? 1 : 0,
            hasKeggs: (next.annotations.keggs?.length ?? 0) > 0 ? 1 : 0,
            hasGos: (next.annotations.gos?.length ?? 0) > 0 ? 1 : 0,
          };

          toUpdate.push(next);
        } else {
          const ann = {
            interpros: uniq((appendObj.annotations.interpros ?? []) as any[]),
            pfams: uniq((appendObj.annotations.pfams ?? []) as any[]),
            cogs: uniq(appendObj.annotations.cogs ?? []),
            keggs: uniq(appendObj.annotations.keggs ?? []),
            gos: uniq((appendObj.annotations.gos ?? []) as any[]),
          };
          const draft: any = {
            contigId: id,
            contigName: appendObj.contigName,
            length: appendObj.length,
            annotations: ann,
            // compute presence flags (length > 0)
            annotationsPresence: {
              hasInterpros: ann.interpros.length > 0 ? 1 : 0,
              hasPfams: ann.pfams.length > 0 ? 1 : 0,
              hasCogs: ann.cogs.length > 0 ? 1 : 0,
              hasKeggs: ann.keggs.length > 0 ? 1 : 0,
              hasGos: ann.gos.length > 0 ? 1 : 0,
            },
          };
          toAdd.push(draft as Contig);
        }
      }

      if (toUpdate.length) await db.contigs.bulkPut(toUpdate);
      if (toAdd.length) await db.contigs.bulkAdd(toAdd);
    });
  }

  const onBatch = Comlink.proxy(async (rows: any[]) => {
    if (!rows?.length || cancelled) return;

    let contigsToUpsert: contigUpsertDefinition[] = [];

    forIn(
      groupBy(rows, (row) => row.seqid),
      (annotations, contigId) => {
        contigsToUpsert.push({
          contigId: contigNameToContigId(contigId),
          contigName: contigId,
          annotsToAppend: {
            interpros: filter(
              flatMap(annotations, (row) => row.indexableAttrValues.interpro),
              (annot) => !!annot
            ),
            pfams: filter(
              flatMap(annotations, (row) => row.indexableAttrValues.pfam),
              (annot) => !!annot
            ),
            cogs: filter(
              flatMap(annotations, (row) => row.indexableAttrValues.cog),
              (annot) => !!annot
            ),
            keggs: filter(
              flatMap(annotations, (row) => row.indexableAttrValues.kegg),
              (annot) => !!annot
            ),
            gos: filter(
              flatMap(
                annotations,
                (row) => row.indexableAttrValues.Ontology_term
              ),
              (annot) => !!annot
            ),
          },
        });
      }
    );
    await bulkUpsertContigAnnotations(contigsToUpsert);
  });

  const start = async () => {
    try {
      onBegin?.();

      if (clearExisting) {
        await db.transaction('rw', db.meta, db.contigs, async () => {
          await db.contigs.clear();
          await db.meta.put({ key: 'sourceUrl', value: url });
          await db.meta.put({
            key: 'assemblyAccession',
            value: assemblyAccession,
          });
          await db.meta.put({ key: 'importStartedAt', value: Date.now() });
        });
      }

      await api.importGff(
        url,
        indexUrl,
        Comlink.proxy(progressCb),
        Comlink.proxy(onBatch),
        attrsToIndex,
        batchSize
      );

      const seconds = (performance.now() - startT) / 1000;

      if (fastaUrl && fastaFaiUrl && fastaGziUrl) {
        const fastaBgzHandler = new BgzipIndexedFasta({
          fasta: new RemoteFile(fastaUrl),
          fai: new RemoteFile(fastaFaiUrl),
          gzi: new RemoteFile(fastaGziUrl),
        });
        const contigLengths = await fastaBgzHandler.getSequenceSizes();
        await db.transaction('rw', db.meta, db.contigs, async () => {
          await db.contigs.bulkUpdate(
            map(contigLengths, (length, contigName) => ({
              key: contigNameToContigId(contigName),
              changes: { length },
            }))
          );
        });
      }
      onEnd?.({ seconds, contigsCount: await db.contigs.count() });
    } catch (e) {
      if (!cancelled) onError?.(e);
      throw e;
    } finally {
      worker.terminate();
    }
  };

  const cancel = () => {
    cancelled = true;
    worker.terminate();
  };
  return { start, cancel };
}
