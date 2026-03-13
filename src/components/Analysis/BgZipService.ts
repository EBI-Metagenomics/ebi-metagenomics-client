/* eslint-disable no-bitwise */

import * as pako from 'pako';
import { Download } from 'interfaces/index';
import { find } from 'lodash-es';

const MAX_BLOCK_SIZE = 100000;

export interface GziBlock {
  compressedOffset: number;
  uncompressedOffset: number;
}

export class BGZipService {
  private gziIndex: GziBlock[] = [];

  public isInitialized = false;

  private readonly dataFileUrl: string;

  private readonly indexFileUrl?: string;

  private readonly leadingTsvCommentChars: string;

  private firstPageIsOnlyComments: boolean = false;

  public static getIndexFileUrl(
    download: Download,
    index_type: string = 'gzi'
  ): string | undefined {
    const relative_url = find(
      download.index_files ?? [],
      (index) => index.index_type === index_type
    )?.relative_url;

    return (
      relative_url &&
      new URL(relative_url, download.url.replace(/[^/]+$/, '')).toString()
    );
  }

  constructor(
    private download: Download,
    autoInitialize = true,
    leadingTsvCommentChars = '#'
  ) {
    this.dataFileUrl = this.download.url;
    this.leadingTsvCommentChars = leadingTsvCommentChars;
    const idx = BGZipService.getIndexFileUrl(this.download);

    if (idx) {
      this.indexFileUrl = idx;
    }

    if (autoInitialize && this.indexFileUrl) {
      this.initialize().then(() => console.groupEnd());
    }
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!this.indexFileUrl) {
      console.warn(
        'No index file found for BGZip download; random-access BGZF methods will not be available.'
      );
      return false;
    }

    try {
      console.groupCollapsed('Initialize BGZip Service');
      const response = await fetch(this.indexFileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch index file: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      const parsedGziMapping = await this.parseGziIndex(buffer);

      if (parsedGziMapping.length === 0) {
        throw new Error('Invalid index file - no entries found');
      }

      this.gziIndex = parsedGziMapping;
      this.isInitialized = true;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching GZI index:', errorMessage);
      return false;
    } finally {
      console.groupEnd();
    }
  }

  private async getFileSize(): Promise<number> {
    const headResponse = await fetch(this.dataFileUrl, { method: 'HEAD' });
    const contentLength = Number(
      headResponse.headers.get('content-length') || '0'
    );
    console.debug(`Compressed file size: ${contentLength}`);
    return contentLength;
  }

  private async parseGziIndex(buffer: ArrayBuffer): Promise<GziBlock[]> {
    console.groupCollapsed('Parsing the GZI');

    const view = new DataView(buffer);
    const numIndexEntries = Number(view.getBigUint64(0, true));
    console.log('GZI has index block count of', numIndexEntries);

    const blocks: GziBlock[] = [];

    for (let i = 0; i < numIndexEntries; i++) {
      const baseOffset = 8 + i * 16;

      const compressedOffset = Number(view.getBigUint64(baseOffset, true));
      const uncompressedOffset = Number(
        view.getBigUint64(baseOffset + 8, true)
      );

      blocks.push({
        compressedOffset,
        uncompressedOffset,
      });
    }

    if (blocks.length === 0) {
      console.log('Index file is empty');
      const size = await this.getFileSize();
      if (size > MAX_BLOCK_SIZE) {
        throw new Error('Index file is empty, but compressed file is too big.');
      }
      console.warn(
        'No index entries, but file is small so adding synthetic entry at 0'
      );
      blocks.unshift({
        compressedOffset: 0,
        uncompressedOffset: 0,
      });
    }

    if (blocks[0].uncompressedOffset > 0) {
      console.warn(
        'First index entry uncompressed offset > 0, adding synthetic entry at 0'
      );
      blocks.unshift({
        compressedOffset: 0,
        uncompressedOffset: 0,
      });
    }

    console.log('Parsed GZI blocks', blocks);

    this.gziIndex = blocks;
    console.groupEnd();
    return blocks;
  }

  decompressBGZFBlock(block: Uint8Array): Uint8Array {
    if (!this.isInitialized) {
      throw new Error('Service not initialized yet');
    }
    if (block.length < 18) {
      throw new Error('Block too small to be valid BGZF');
    }

    const blockSize = block[16] + (block[17] << 8) + 1;
    if (blockSize > block.length) {
      throw new Error(
        `Block size ${blockSize} larger than buffer length ${block.length}`
      );
    }

    const deflateStart = 18;
    const deflateEnd = blockSize - 8;
    const deflateData = block.subarray(deflateStart, deflateEnd);
    console.debug(`Decompressing block of size ${deflateData.length}`);
    return pako.inflateRaw(deflateData);
  }

  async fetchAndDecompressBlock(compressedOffset: number): Promise<Uint8Array> {
    const maxBlockSize = 65536;
    const start = Number(compressedOffset);
    const end = start + maxBlockSize - 1;

    const response = await fetch(this.dataFileUrl, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });
    if (!response.ok && response.status !== 206) {
      throw new Error(`Range request failed: ${response.status}`);
    }
    const compressedChunk = new Uint8Array(await response.arrayBuffer());
    return this.decompressBGZFBlock(compressedChunk);
  }

  getSourcePageNumber(pageNum: number): number {
    return this.firstPageIsOnlyComments ? pageNum + 1 : pageNum;
  }

  async readPage(pageNum: number): Promise<Uint8Array> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized yet');
    }
    if (pageNum < 0 || pageNum >= this.gziIndex.length) {
      console.log(`No data for page ${pageNum}`);
      return new Uint8Array(0);
    }
    console.debug(
      `Fetching block ${pageNum} from ${this.gziIndex.length} index entries`
    );
    const entry = this.gziIndex[pageNum];
    console.debug(`Fetching block ${entry.compressedOffset}`);
    return this.fetchAndDecompressBlock(entry.compressedOffset);
  }

  async readPageAsTSV(pageNum: number): Promise<string[][]> {
    console.groupCollapsed('Read blockzip page/block as TSV');
    const sourcePageNum = this.getSourcePageNumber(pageNum);
    console.debug(`Will read blockzip page ${sourcePageNum}`);
    const pageBytes = await this.readPage(sourcePageNum - 1);
    console.debug(`Read blockzip page size ${pageBytes.length}`);
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(pageBytes);

    const lines = text
      .split('\n')
      .filter(
        (line) =>
          line.trim().length > 0 &&
          !line.startsWith(this.leadingTsvCommentChars)
      );

    console.debug(`Lines ${lines.length}`);
    if (lines.length === 0 && pageNum === 1) {
      this.firstPageIsOnlyComments = true;
      console.log(
        'First page is only comments, so treating block 2 as page 1.'
      );
      console.groupEnd();
      return this.readPageAsTSV(pageNum);
    }

    const rows = lines.map((line) => line.split('\t'));
    console.debug(`Rows ${rows.length}`);
    console.groupEnd();
    return rows;
  }

  /**
   * Reads a full ordinary .gz file into text.
   * This is for non-indexed gzip files like .json.gz, not BGZF random access.
   */
  async readGzipFileAsText(): Promise<string> {
    console.groupCollapsed('Read full gzip file as text');

    const response = await fetch(this.dataFileUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch gzip file: ${response.status} ${response.statusText}`
      );
    }

    const compressed = new Uint8Array(await response.arrayBuffer());
    console.debug(`Compressed gzip file size: ${compressed.length}`);

    const decompressed = pako.ungzip(compressed);
    console.debug(`Decompressed gzip file size: ${decompressed.length}`);

    const text = new TextDecoder('utf-8').decode(decompressed);

    console.groupEnd();
    return text;
  }

  /**
   * Reads a full ordinary .json.gz file and parses it as JSON.
   */
  async readGzipJSON<T = unknown>(): Promise<T> {
    const text = await this.readGzipFileAsText();

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON from gzip file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Reads Genome Properties JSON and converts it into the same
   * presence/absence count map used by the hierarchy visualiser.
   */
  async readGenomePropertiesCountsFromGzipJSON(): Promise<
    Record<string, number>
  > {
    type GenomePropertyJSON = Record<
      string,
      {
        property?: string;
        values?: Record<string, unknown>;
        name?: string;
        steps?: unknown[];
      }
    >;

    const data = await this.readGzipJSON<GenomePropertyJSON>();
    const counts: Record<string, number> = {};

    Object.entries(data).forEach(([fallbackId, propertyRecord]) => {
      const id = propertyRecord.property || fallbackId;
      const values = propertyRecord.values || {};

      const accessionKey = Object.keys(values).find((key) => key !== 'TOTAL');

      if (!accessionKey) {
        counts[id] = 0;
        return;
      }

      const rawValue = values[accessionKey];

      const normalizedValue =
        typeof rawValue === 'string' ? rawValue.toUpperCase() : '';

      counts[id] =
        normalizedValue === 'YES' || normalizedValue === 'PARTIAL' ? 1 : 0;
    });

    return counts;
  }

  getPageCount() {
    console.debug(`Page count is ${this.gziIndex.length}`);
    return this.firstPageIsOnlyComments
      ? this.gziIndex.length - 1
      : this.gziIndex.length;
  }
}
