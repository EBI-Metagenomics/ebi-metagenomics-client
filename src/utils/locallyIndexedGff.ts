import Dexie, { Table } from 'dexie';
import * as Comlink from 'comlink';
import { filter, flatMap, forIn, groupBy, uniq } from 'lodash-es';
import { RemoteFile } from 'generic-filehandle2';
import { BgzipIndexedFasta, IndexedFasta } from '@gmod/indexedfasta';

export type ContigDetails = {
  contigName: string;
  length: number;
  annotationText: string;
  annotations: Record<string, string[] | undefined>;
  annotationsPresence: Record<string, number | undefined>;
};

export type Contig = ContigDetails & {
  contigId: number;
};

type MetaKeys =
  | 'assemblyAccession'
  | 'importStartedAt'
  | 'importCompletedAt'
  | 'sourceUrl'
  | 'indexSpec';

export function contigNameToContigId(contigName: string): number {
  const numericSuffix = parseInt(contigName.split('_')[1], 10);
  if (Number.isFinite(numericSuffix)) return numericSuffix;

  let hash = 0;
  for (let i = 0; i < contigName.length; i++) {
    hash = (hash * 31 + contigName.charCodeAt(i)) % Number.MAX_SAFE_INTEGER;
  }
  return hash;
}

class GffDB extends Dexie {
  contigs!: Table<Contig, number>;
  coordinates!: Table<CoordinateBatch, [string, number]>;
  meta!: Table<{ key: MetaKeys; value: any }, string>;
  constructor(name = 'gffdb') {
    super(name);
    this.version(5).stores({
      contigs:
        'contigId, length, *annotations.interpros, *annotations.pfams, *annotations.cogs, *annotations.keggs, *annotations.gos, ' +
        '*annotations.eggnogs, *annotations.ecNumbers, *annotations.genes, *annotations.products, *annotations.rfams, ' +
        '*annotations.mibigs, *annotations.mibigClasses, *annotations.dbXrefs, ' +
        '*annotations.geccoBgcTypes, *annotations.antismashProducts, *annotations.antismashFunctions, ' +
        '*annotations.dbcanProtTypes, *annotations.dbcanProtFamilies, *annotations.dbcanPulSubstrates, ' +
        '*annotations.dbcanSubstrates, *annotations.amrGenes, *annotations.amrDrugClasses, *annotations.amrDrugSubclasses, ' +
        '*annotations.amrElementTypes, *annotations.amrElementSubtypes, *annotations.mobileElementTypes, *annotations.mobileOGs, ' +
        '*annotations.trnaIsotypes, *annotations.ncrnaClasses, *annotations.defenseFinderTypes, ' +
        '*annotations.defenseFinderSubtypes, *annotations.defenseFinderActivities, *annotations.viralTaxonomies, ' +
        '*annotations.viphogTaxonomies, ' +
        'annotationsPresence.hasInterpros, annotationsPresence.hasPfams, annotationsPresence.hasCogs, ' +
        'annotationsPresence.hasKeggs, annotationsPresence.hasGos, annotationsPresence.hasEggnogs, ' +
        'annotationsPresence.hasEcNumbers, annotationsPresence.hasGenes, annotationsPresence.hasProducts, ' +
        'annotationsPresence.hasRfams, annotationsPresence.hasMibigs, annotationsPresence.hasMibigClasses, ' +
        'annotationsPresence.hasDbXrefs, annotationsPresence.hasGeccoBgcTypes, annotationsPresence.hasAntismashProducts, ' +
        'annotationsPresence.hasAntismashFunctions, annotationsPresence.hasDbcanProtTypes, annotationsPresence.hasDbcanProtFamilies, ' +
        'annotationsPresence.hasDbcanPulSubstrates, annotationsPresence.hasDbcanSubstrates, annotationsPresence.hasAmrGenes, ' +
        'annotationsPresence.hasAmrDrugClasses, annotationsPresence.hasAmrDrugSubclasses, annotationsPresence.hasAmrElementTypes, ' +
        'annotationsPresence.hasAmrElementSubtypes, annotationsPresence.hasMobileElementTypes, ' +
        'annotationsPresence.hasMobileOGs, annotationsPresence.hasTrnaIsotypes, ' +
        'annotationsPresence.hasNcrnaClasses, annotationsPresence.hasDefenseFinderTypes, ' +
        'annotationsPresence.hasDefenseFinderSubtypes, annotationsPresence.hasDefenseFinderActivities, ' +
        'annotationsPresence.hasViralTaxonomies, ' +
        'annotationsPresence.hasViphogTaxonomies',
      //contigId is the primary key since named first - this is the contig integer index so that contigs
      // can be sorted by contig index rather than alphanumerically... contig 312 should be after contig 99.
      // The assembly key needs prepended to this to make a locus tag.
      meta: 'key',
    });
    this.version(6).stores({
      coordinates: '[contigName+textStart]',
    });
  }
}

export type CoordinateBatch = {
  contigName: string;
  textStart: number;
  // Triples: local annotation end offset, one-based feature start, inclusive end.
  // Typed arrays avoid one object and three database keys per feature.
  spans: Uint32Array | Float64Array;
};

export function packFeatureSpans(values: number[]) {
  return values.every((value) => value <= 0xffffffff)
    ? new Uint32Array(values)
    : new Float64Array(values);
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
    indexUrl: string | undefined,
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
  indexUrl?: string; // to paginate bgzipped gff when available
  fastaUrl?: string; // to get the length of each contig
  fastaFaiUrl?: string; // ^
  fastaGziUrl?: string; // ^
  attrsToIndex: Array<TypeAheadAttributes | GffAttributeIndexSpec>;
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
  | 'cogs'
  | 'eggnogs'
  | 'ecNumbers'
  | 'genes'
  | 'products'
  | 'rfams'
  | 'mibigs'
  | 'mibigClasses'
  | 'dbXrefs'
  | 'geccoBgcTypes'
  | 'antismashProducts'
  | 'antismashFunctions'
  | 'dbcanProtTypes'
  | 'dbcanProtFamilies'
  | 'dbcanPulSubstrates'
  | 'dbcanSubstrates'
  | 'amrGenes'
  | 'amrDrugClasses'
  | 'amrDrugSubclasses'
  | 'amrElementTypes'
  | 'amrElementSubtypes'
  | 'mobileElementTypes'
  | 'mobileOGs'
  | 'trnaIsotypes'
  | 'ncrnaClasses'
  | 'defenseFinderTypes'
  | 'defenseFinderSubtypes'
  | 'defenseFinderActivities'
  | 'viralTaxonomies'
  | 'viphogTaxonomies';

export type GffAttributeIndexSpec = {
  gffKey: string | string[];
  field: TypeAheadAttributes;
};

export const PRESENCE_FIELD_BY_ATTRIBUTE: Record<TypeAheadAttributes, string> =
  {
    interpros: 'hasInterpros',
    pfams: 'hasPfams',
    cogs: 'hasCogs',
    keggs: 'hasKeggs',
    gos: 'hasGos',
    eggnogs: 'hasEggnogs',
    ecNumbers: 'hasEcNumbers',
    genes: 'hasGenes',
    products: 'hasProducts',
    rfams: 'hasRfams',
    mibigs: 'hasMibigs',
    mibigClasses: 'hasMibigClasses',
    dbXrefs: 'hasDbXrefs',
    geccoBgcTypes: 'hasGeccoBgcTypes',
    antismashProducts: 'hasAntismashProducts',
    antismashFunctions: 'hasAntismashFunctions',
    dbcanProtTypes: 'hasDbcanProtTypes',
    dbcanProtFamilies: 'hasDbcanProtFamilies',
    dbcanPulSubstrates: 'hasDbcanPulSubstrates',
    dbcanSubstrates: 'hasDbcanSubstrates',
    amrGenes: 'hasAmrGenes',
    amrDrugClasses: 'hasAmrDrugClasses',
    amrDrugSubclasses: 'hasAmrDrugSubclasses',
    amrElementTypes: 'hasAmrElementTypes',
    amrElementSubtypes: 'hasAmrElementSubtypes',
    mobileElementTypes: 'hasMobileElementTypes',
    mobileOGs: 'hasMobileOGs',
    trnaIsotypes: 'hasTrnaIsotypes',
    ncrnaClasses: 'hasNcrnaClasses',
    defenseFinderTypes: 'hasDefenseFinderTypes',
    defenseFinderSubtypes: 'hasDefenseFinderSubtypes',
    defenseFinderActivities: 'hasDefenseFinderActivities',
    viralTaxonomies: 'hasViralTaxonomies',
    viphogTaxonomies: 'hasViphogTaxonomies',
  };

const normalizeAttributeIndexSpecs = (
  attrsToIndex: Array<TypeAheadAttributes | GffAttributeIndexSpec>
): GffAttributeIndexSpec[] =>
  attrsToIndex.map((attr) =>
    typeof attr === 'string' ? { gffKey: attr, field: attr } : attr
  );

const GFF_INDEX_CONTENT_VERSION = 4;

export const getGffIndexSpec = (
  attrsToIndex: Array<TypeAheadAttributes | GffAttributeIndexSpec>
): string =>
  JSON.stringify({
    contentVersion: GFF_INDEX_CONTENT_VERSION,
    attributes: normalizeAttributeIndexSpecs(attrsToIndex),
  });

const getPresenceFlags = (
  annotations: ContigDetails['annotations']
): ContigDetails['annotationsPresence'] =>
  Object.fromEntries(
    Object.entries(PRESENCE_FIELD_BY_ATTRIBUTE)
      .filter(([attribute]) => annotations[attribute]?.length)
      .map(([, presence]) => [presence, 1])
  );

export async function getTypeaheadSuggestions(
  query: string,
  attribute: TypeAheadAttributes,
  limit: number = 10
): Promise<string[]> {
  try {
    const upperQuery = query.toUpperCase();
    const indexName = `annotations.${attribute}`;

    if (!query) {
      const contigs = await db.contigs
        .orderBy(indexName)
        .limit(limit * 5)
        .toArray();

      return Array.from(
        new Set(
          contigs.flatMap((contig) => contig.annotations[attribute] || [])
        )
      )
        .sort()
        .slice(0, limit);
    }

    // Get all unique attributes (e.g. interpros) that start with the query
    const suggestions = await db.contigs
      .where(indexName)
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
    indexUrl = undefined,
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
  const attrIndexSpecs = normalizeAttributeIndexSpecs(attrsToIndex);
  let worker: Worker | undefined;
  let startT = performance.now();
  let cancelled = false;
  let contigLengths: Record<string, number> = {};

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
    annotationTextToAppend: Contig['annotationText'];
    annotsToAppend: Contig['annotations'];
    featureSpans: number[];
  };

  async function bulkUpsertContigAnnotations(
    updates: contigUpsertDefinition[]
  ) {
    const merged = new Map<Contig['contigId'], ContigDetails>();
    for (const {
      contigId,
      annotsToAppend,
      annotationTextToAppend,
      contigName,
      length,
    } of updates) {
      if (
        merged.has(contigId) &&
        merged.get(contigId)!.contigName !== contigName
      ) {
        throw new Error(`Contig key collision for ${contigName}`);
      }
      const acc =
        merged.get(contigId) ??
        ({
          contigName: contigName,
          length: length,
          annotationText: '',
          annotations: {},
          annotationsPresence: {},
        } as ContigDetails);
      acc.annotationText += annotationTextToAppend;
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
    const updatesById = new Map(
      updates.map((update) => [update.contigId, update])
    );

    await db.transaction('rw', db.contigs, db.coordinates, async () => {
      const existing = await db.contigs.bulkGet(ids);
      const toUpdate: Contig[] = [];
      const toAdd: Contig[] = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const row = existing[i] as Contig | undefined;
        const appendObj = merged.get(id)!;
        if (row && row.contigName !== appendObj.contigName) {
          throw new Error(
            `Contig key collision: ${row.contigName}, ${appendObj.contigName}`
          );
        }

        const update = updatesById.get(id)!;
        if (update.featureSpans.length) {
          await db.coordinates.add({
            contigName: appendObj.contigName,
            textStart: row?.annotationText.length ?? 0,
            spans: packFeatureSpans(update.featureSpans),
          });
        }

        if (row) {
          // Update: append + dedupe each annotation within nested annotations.*
          const next: Contig = {
            ...row,
            annotationText:
              (row.annotationText || '') + appendObj.annotationText,
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
          next.annotationsPresence = getPresenceFlags(next.annotations);

          toUpdate.push(next);
        } else {
          const ann = Object.fromEntries(
            attrIndexSpecs.map(({ field }) => [
              field,
              uniq((appendObj.annotations[field] ?? []) as string[]),
            ])
          ) as ContigDetails['annotations'];
          const draft: any = {
            contigId: id,
            contigName: appendObj.contigName,
            length: appendObj.length,
            annotationText: appendObj.annotationText,
            annotations: ann,
            annotationsPresence: getPresenceFlags(ann),
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

    const contigsToUpsert: contigUpsertDefinition[] = [];

    forIn(
      groupBy(rows, (row) => row.seqid),
      (annotations, contigId) => {
        const annotsToAppend = Object.fromEntries(
          attrIndexSpecs.map(({ gffKey, field }) => [
            field,
            filter(
              flatMap(Array.isArray(gffKey) ? gffKey : [gffKey], (key) =>
                flatMap(
                  annotations,
                  (row) => row.indexableAttrValues[key.toLowerCase()]
                )
              ),
              (annot) => !!annot
            ),
          ])
        ) as Contig['annotations'];

        let textEnd = 0;
        const featureSpans: number[] = [];
        for (const annotation of annotations) {
          if (!annotation.annotationText) continue;
          textEnd += annotation.annotationText.length;
          const valid =
            Number.isSafeInteger(annotation.start) &&
            Number.isSafeInteger(annotation.end) &&
            annotation.start >= 1 &&
            annotation.end >= annotation.start;
          featureSpans.push(
            textEnd,
            valid ? annotation.start : 0,
            valid ? annotation.end : 0
          );
        }
        contigsToUpsert.push({
          contigId: contigNameToContigId(contigId),
          contigName: contigId,
          length: contigLengths[contigId],
          annotationTextToAppend: annotations
            .map((row) => row.annotationText || '')
            .join(''),
          annotsToAppend,
          featureSpans,
        });
      }
    );
    await bulkUpsertContigAnnotations(contigsToUpsert);
  });

  const start = async () => {
    try {
      navigator.storage?.persist?.().catch(() => undefined);
      const created = createWorker();
      worker = created.worker;
      const { api } = created;
      onBegin?.();

      if (clearExisting) {
        await db.transaction(
          'rw',
          db.meta,
          db.contigs,
          db.coordinates,
          async () => {
            await db.meta.delete('importCompletedAt');
            await db.contigs.clear();
            await db.coordinates.clear();
            await db.meta.put({ key: 'sourceUrl', value: url });
            await db.meta.put({
              key: 'indexSpec',
              value: getGffIndexSpec(attrIndexSpecs),
            });
            await db.meta.put({
              key: 'assemblyAccession',
              value: assemblyAccession,
            });
            await db.meta.put({ key: 'importStartedAt', value: Date.now() });
          }
        );
      }

      if (!clearExisting) await db.meta.delete('importCompletedAt');

      if (fastaUrl && fastaFaiUrl) {
        const fastaHandler = fastaGziUrl
          ? new BgzipIndexedFasta({
              fasta: new RemoteFile(fastaUrl),
              fai: new RemoteFile(fastaFaiUrl),
              gzi: new RemoteFile(fastaGziUrl),
            })
          : new IndexedFasta({
              fasta: new RemoteFile(fastaUrl),
              fai: new RemoteFile(fastaFaiUrl),
            });
        contigLengths = await fastaHandler.getSequenceSizes();
      }

      if (cancelled) return;

      await api.importGff(
        url,
        indexUrl,
        Comlink.proxy(progressCb),
        Comlink.proxy(onBatch),
        Array.from(
          new Set(
            flatMap(attrIndexSpecs, ({ gffKey }) =>
              Array.isArray(gffKey) ? gffKey : [gffKey]
            )
          )
        ),
        batchSize
      );

      if (cancelled) return;
      await db.meta.put({ key: 'importCompletedAt', value: Date.now() });
      const seconds = (performance.now() - startT) / 1000;
      onEnd?.({ seconds, contigsCount: await db.contigs.count() });
    } catch (e) {
      if (!cancelled) onError?.(e);
      throw e;
    } finally {
      worker?.terminate();
    }
  };

  const cancel = () => {
    cancelled = true;
    worker?.terminate();
  };
  return { start, cancel };
}
