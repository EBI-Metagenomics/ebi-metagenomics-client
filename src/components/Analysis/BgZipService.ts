/* eslint-disable no-bitwise */

import * as pako from 'pako';
import { Download } from 'interfaces/index';
import { find } from 'lodash-es';

const MAX_BLOCK_SIZE = 100000;

export interface GziBlock {
  compressedOffset: number;
  uncompressedOffset: number;
}

/**
 * Service for handling BGZF (Blocked GNU Zip Format) compressed files with random access capabilities.
 * Specifically: allows the random fetching of "pages" (blocks) of text files like TSV and GFF.
 *
 *
 * @param download - Download object containing URL and index file information
 * @param autoInitialize - Whether to automatically initialize the service (default: true)
 * @param leadingTsvCommentChars - Characters to treat as comment lines (default: "#"),
 * in which case those lines are removed from pages (and empty pages are made invisible)
 */
export class BGZipService {
  private gziIndex: GziBlock[] = [];

  public isInitialized = false;

  private readonly dataFileUrl: string;

  private readonly indexFileUrl: string;

  private firstPageIsOnlyComments = false;

  /**
   * Generates the full URL for a GZI index file based on the download object
   * @param download - Download object containing URL and index file information
   * @param indexType - E.g. gzi (default) or fai
   * @returns The full URL for the GZI index file
   */
  public static getIndexFileUrl(
    download: Download,
    indexType = 'gzi'
  ): string | undefined {
    const relativeUrl = find(
      download.index_files ?? [],
      (index) => index.index_type === indexType
    )?.relative_url;

    return (
      relativeUrl &&
      new URL(relativeUrl, download.url.replace(/[^/]+$/, '')).toString()
    );
  }

  constructor(private download: Download, autoInitialize = true) {
    this.dataFileUrl = this.download.url;
    const idx = BGZipService.getIndexFileUrl(this.download);
    if (idx) {
      this.indexFileUrl = idx;
    } else {
      throw new Error('No index file found for BGZip download');
    }
    if (autoInitialize) {
      this.initialize().then(() => {
        // Empty
      });
    }
  }

  /**
   * Initialize the service by loading the index file
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
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
    } finally {
      /* empty */
    }
  }

  private async getFileSize(): Promise<number> {
    const headResponse = await fetch(this.dataFileUrl, { method: 'HEAD' });

    return Number(headResponse.headers.get('content-length') || '0');
  }

  private async parseGziIndex(buffer: ArrayBuffer): Promise<GziBlock[]> {
    const view = new DataView(buffer);
    const numIndexEntries = Number(view.getBigUint64(0, true));
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

    /*
     Handle edge cases: if first uncompressed offset > 0, prepend artificial entry for offset 0.
     If the index is empty, make fake block of the entire file unless it seems bizarrely large.
    */
    if (blocks.length === 0) {
      const size = await this.getFileSize();
      if (size > MAX_BLOCK_SIZE) {
        throw new Error('Index file is empty, but compressed file is too big.');
      }
      blocks.unshift({
        compressedOffset: 0,
        uncompressedOffset: 0,
      });
    }
    if (blocks[0].uncompressedOffset > 0) {
      blocks.unshift({
        compressedOffset: 0,
        uncompressedOffset: 0,
      });
    }

    this.gziIndex = blocks;
    return blocks;
  }

  decompressBGZFBlock(block: Uint8Array): Uint8Array {
    if (!this.isInitialized) {
      throw new Error('Service not initialized yet');
    }
    if (block.length < 18) {
      throw new Error('Block too small to be valid BGZF');
    }
    // Block size stored at bytes 16 and 17 (0-based)
    const blockSize = block[16] + (block[17] << 8) + 1;
    if (blockSize > block.length) {
      throw new Error(
        `Block size ${blockSize} larger than buffer length ${block.length}`
      );
    }
    const deflateStart = 18;
    const deflateEnd = blockSize - 8; // footer 8 bytes
    const deflateData = block.subarray(deflateStart, deflateEnd);
    return pako.inflateRaw(deflateData);
  }

  async fetchAndDecompressBlock(compressedOffset: number): Promise<Uint8Array> {
    // BGZF max block size is 64KB (65536 bytes)
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

  /**
   * Fetches one full BGZF block as a page.
   */
  async readPage(pageNum: number): Promise<Uint8Array> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized yet');
    }
    if (pageNum < 0 || pageNum >= this.gziIndex.length) {
      return new Uint8Array(0); // Out of range → empty
    }
    const entry = this.gziIndex[pageNum];
    return this.fetchAndDecompressBlock(entry.compressedOffset);
  }
}
