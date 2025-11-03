// Worker (so background thread) to stream BGZF GFF in browser
import { expose } from 'comlink';
import { BgzfFilehandle } from '@gmod/bgzf-filehandle';

type HeadersInitLike = HeadersInit | Record<string, string> | undefined;

import type { GenericFilehandle, FilehandleOptions } from 'generic-filehandle2';

class HttpRangeFilehandle implements GenericFilehandle {
  constructor(private url: string, private headers?: HeadersInit) {}
  // This is pretty much a shim so that BGZip File Reader can read in the browser
  // without failing on .stat calls (which are only in node)

  async read(
    length: number,
    position: number,
    opts?: any
  ): Promise<Uint8Array<ArrayBuffer>> {
    const end = position + Math.max(0, length) - 1;

    const controller = new AbortController();
    if (opts?.signal) {
      if (opts.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      const onAbort = () => controller.abort();
      opts.signal.addEventListener('abort', onAbort, { once: true });
    }

    const res = await fetch(this.url, {
      headers: { Range: `bytes=${position}-${end}`, ...(this.headers || {}) },
      signal: controller.signal,
    });

    if (!(res.ok || res.status === 206)) {
      throw new Error(`Range GET failed ${res.status} ${res.statusText}`);
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.length > length ? buf.subarray(0, length) : buf;
  }

  // Overloads to match generic-filehandle2
  readFile(): Promise<Uint8Array<ArrayBuffer>>;
  readFile(encoding: BufferEncoding): Promise<string>;
  readFile<T extends undefined>(
    options:
      | Omit<FilehandleOptions, 'encoding'>
      | (Omit<FilehandleOptions, 'encoding'> & { encoding?: T })
  ): Promise<Uint8Array<ArrayBuffer>>;
  readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T }
  ): Promise<string>;
  async readFile(options?: any): Promise<any> {
    const res = await fetch(this.url, { headers: this.headers });
    if (!res.ok) throw new Error(`GET failed ${res.status} ${res.statusText}`);
    const u8 = new Uint8Array(await res.arrayBuffer());
    if (typeof options === 'string') return new TextDecoder(options).decode(u8);
    if (options?.encoding) return new TextDecoder(options.encoding).decode(u8);
    return u8;
  }

  async stat(): Promise<{ size: number }> {
    try {
      // try a tiny range probe; avoids HEAD
      const r = await fetch(this.url, {
        headers: { Range: 'bytes=0-0', ...(this.headers || {}) },
      });
      const cr =
        r.headers.get('Content-Range') || r.headers.get('content-range');
      if (cr && cr.includes('/')) {
        const total = Number(cr.split('/')[1]);
        if (Number.isFinite(total)) return { size: total };
      }
      const cl = r.headers.get('Content-Length');
      if (cl && Number.isFinite(Number(cl))) return { size: Number(cl) };
    } catch {
      /* ignore */
    }
    return { size: Number.MAX_SAFE_INTEGER };
  }

  async close(): Promise<void> {
    // no-op in browser
  }
}

const textDecoder = new TextDecoder();

function makeLineProcessor(onLine: (line: string) => void) {
  let carry = '';
  return (u8: Uint8Array, finalize = false) => {
    const text = textDecoder.decode(u8, { stream: !finalize });
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 10) {
        const line = carry + text.slice(start, i);
        carry = '';
        start = i + 1;
        if (line && line[0] !== '#') onLine(line);
      }
    }
    carry += text.slice(start);
    if (finalize && carry) {
      const line = carry;
      carry = '';
      if (line && line[0] !== '#') onLine(line);
    }
  };
}

// Minimal scanner for GFF attributes that only extracts requested keys.
function parseSelectedAttributes(
  attrs: string | undefined,
  wanted: Set<string>,
  indexTargets: Set<string>
): {
  idAttr?: string;
  parent?: string;
  name?: string;
  product?: string;
  indexableAttrValues: Record<string, string[]>;
} {
  const out: {
    idAttr?: string;
    parent?: string;
    name?: string;
    product?: string;
    indexableAttrValues: Record<string, string[]>;
  } = { indexableAttrValues: {} };

  if (!attrs || attrs === '.') return out;

  // Scan "k=v;..." without splitting everything up-front
  const len = attrs.length;
  let i = 0;

  const conditionalDecode = (s: string) =>
    s.indexOf('%') >= 0 || s.indexOf('+') >= 0 ? decodeURIComponent(s) : s;

  while (i < len) {
    // TODO:  improve readability of this loop.
    // read key
    let kStart = i;
    while (
      i < len &&
      attrs.charCodeAt(i) !== 61 /* '=' */ &&
      attrs.charCodeAt(i) !== 59 /* ';' */
    )
      i++;
    const key = attrs.slice(kStart, i).trim();
    if (i >= len || attrs.charCodeAt(i) !== 61 /* '=' */) {
      // no '='; skip to next ';'
      while (i < len && attrs.charCodeAt(i) !== 59 /* ';' */) i++;
      i++; // skip ';'
      continue;
    }
    i++; // skip '='

    // read value until ';'
    let vStart = i;
    while (i < len && attrs.charCodeAt(i) !== 59 /* ';' */) i++;
    let rawVal = attrs.slice(vStart, i);
    i++; // skip ';' if present

    // Only process if key is wanted (either for indexing or known singletons)
    if (wanted.has(key)) {
      // Values may be comma-separated for multi-valued attributes
      // Split only when needed (for index targets). For singletons, take first.
      if (indexTargets.has(key)) {
        // split on commas, conditionally decode
        const vals = rawVal.length
          ? rawVal.split(',').map((s) => conditionalDecode(s))
          : [];
        if (vals.length) out.indexableAttrValues[key] = vals;
      } else {
        // singleton: take first value (before comma)
        const first = rawVal.length ? rawVal.split(',', 1)[0] : '';
        const val = conditionalDecode(first);
        if (key === 'ID') out.idAttr = val;
        else if (key === 'Parent') out.parent = val;
        else if (key === 'Name') out.name = val;
        else if (key === 'product') out.product = val;
      }
    }
  }
  return out;
}

async function getUncompressedSizeFromGzi(
  indexUrl: string,
  headers?: HeadersInitLike
) {
  try {
    // Try range tail; if not honored, fetch whole .gzi
    const head = await fetch(indexUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-0', ...(headers || {}) },
    });
    const lenHdr =
      head.headers.get('Content-Range') || head.headers.get('Content-Length');
    let totalLen = 0;
    if (lenHdr && lenHdr.includes('/')) totalLen = Number(lenHdr.split('/')[1]);
    else totalLen = Number(head.headers.get('Content-Length') || 0);

    let tail: Uint8Array;
    if (totalLen >= 16) {
      const r = await fetch(indexUrl, {
        headers: {
          Range: `bytes=${totalLen - 16}-${totalLen - 1}`,
          ...(headers || {}),
        },
      });
      if (r.status === 206) tail = new Uint8Array(await r.arrayBuffer());
      else {
        const all = new Uint8Array(
          await (await fetch(indexUrl, { headers })).arrayBuffer()
        );
        tail = all.subarray(Math.max(0, all.length - 16));
      }
    } else {
      const all = new Uint8Array(
        await (await fetch(indexUrl, { headers })).arrayBuffer()
      );
      tail = all.subarray(Math.max(0, all.length - 16));
    }
    const view = new DataView(
      tail.buffer,
      tail.byteOffset + (tail.byteLength - 8),
      8
    );
    const lo = view.getUint32(0, true);
    const hi = view.getUint32(4, true);
    return hi * 2 ** 32 + lo;
  } catch {
    return undefined;
  }
}

async function importGff(
  url: string,
  indexUrl: string,
  onProgress: (b: number, t?: number) => void,
  onBatch: (rows: any[]) => Promise<void>,
  attrsToIndex: string[],
  batchSize = 200,
  headers?: HeadersInitLike
) {
  const t0 = performance.now();

  // Build BGZF-aware filehandle using our HTTP-range wrapper
  const fh = new BgzfFilehandle({
    filehandle: new HttpRangeFilehandle(url, headers),
    gziFilehandle: new HttpRangeFilehandle(indexUrl, headers),
  });

  const uncompressedTotal = await getUncompressedSizeFromGzi(indexUrl, headers);

  // Backpressure-aware batching with double-buffer and serialized flush
  let emitBatch: any[] = [];
  let inFlight = Promise.resolve();

  const scheduleFlush = () => {
    if (!emitBatch.length) return;
    const batch = emitBatch;
    emitBatch = []; // swap buffer immediately to keep batches bounded
    // serialize delivery to consumer
    inFlight = inFlight.then(() => onBatch(batch));
  };

  // Prepare attribute selection sets
  const indexTargets = new Set(attrsToIndex);
  const wanted = new Set<string>([
    'ID',
    'Parent',
    'Name',
    'product',
    ...attrsToIndex,
  ]);

  const onLine = (line: string) => {
    const cols = line.split('\t');
    if (cols.length < 8) return;
    const [seqid, source, type, s, e, score, strand, phase, attrs] = cols;

    // Parse only requested attributes
    const { idAttr, parent, name, product, indexableAttrValues } =
      parseSelectedAttributes(attrs, wanted, indexTargets);

    emitBatch.push({
      seqid,
      source,
      type,
      start: Number(s) || 0,
      end: Number(e) || 0,
      score: score === '.' ? null : Number(score),
      strand: strand || '.',
      phase:
        phase === '0' || phase === '1' || phase === '2' ? Number(phase) : -1,
      indexableAttrValues,
      idAttr,
      parent,
      name,
      product,
    });

    if (emitBatch.length >= batchSize) {
      // Do not await here; keep parsing fast and bounded
      scheduleFlush();
    }
  };

  const processLines = makeLineProcessor(onLine);

  // Stream until EOF
  // eslint-disable-next-line no-bitwise
  const CHUNK = 1 << 20; // 1 MiB (uncompressed)
  let pos = 0;
  for (;;) {
    const chunk = await fh.read(CHUNK, pos); // returns Uint8Array (decompressed bytes)
    if (!chunk.length) break;
    onProgress(pos + chunk.length, uncompressedTotal);
    processLines(chunk);
    // apply backpressure at chunk boundaries
    await inFlight;
    pos += chunk.length;
  }
  // finalize any trailing line
  processLines(new Uint8Array(0), true);
  // flush the remainder and wait for all deliveries
  scheduleFlush();
  await inFlight;

  return (performance.now() - t0) / 1000;
}

expose({ importGff });
