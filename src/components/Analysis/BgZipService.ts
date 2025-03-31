// services/BGZipService.ts
import * as pako from 'pako';

// Types
export interface GziBlock {
  compressedOffset: number;
  uncompressedOffset: number;
  size?: number;
}

export interface FileStats {
  totalSize: number;
  totalBlocks: number;
  totalRecords: number | null;
}

export interface BGZipServiceOptions {
  avgBytesPerRecord?: number;
  onLog?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface BGZipServiceOptions {
  avgBytesPerRecord?: number;
  onLog?: (message: string) => void;
  onError?: (error: string) => void;
  pageSize?: number; // Default page size
}

export class BGZipService {
  private gziIndex: GziBlock[] = [];
  private fileStats: FileStats = {
    totalSize: 0,
    totalBlocks: 0,
    totalRecords: null,
  };
  private isInitialized = false;
  private avgBytesPerRecord: number;
  private logger: (message: string) => void;
  private errorHandler: (error: string) => void;

  constructor(
    private dataFileUrl: string,
    private indexFileUrl: string,
    options: BGZipServiceOptions = {}
  ) {
    this.avgBytesPerRecord = options.avgBytesPerRecord || 100;
    this.logger = options.onLog || console.log;
    this.errorHandler = options.onError || console.error;
  }

  // Add a new method to paginate parsed data
  public async getPagedData<T>(
    page: number,
    pageSize: number,
    parseFunction: (text: string) => T[]
  ): Promise<T[]> {
    console.log('Getting paged data:', page, 'with size', pageSize);

    // Get the raw text data
    const rawData = await this.getPageData(page, pageSize);

    // Parse the data using the provided function
    const allItems = parseFunction(rawData);
    console.log(`Parsed ${allItems.length} total items`);

    // Apply pagination to the parsed items
    const startIdx = 0; // Always start at the beginning of returned data
    const endIdx = Math.min(startIdx + pageSize, allItems.length);

    const pagedItems = allItems.slice(startIdx, endIdx);
    console.log(`Returning ${pagedItems.length} items for page ${page}`);

    return pagedItems;
  }

  /**
   * Initialize the service by loading the index file
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Find actual gzip blocks in the file
      const firstRealBlockOffset = await this.examineFileStructure();
      console.log('First real gzip block offset:', firstRealBlockOffset);

      // Parse the index file
      const response = await fetch(this.indexFileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch index file: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      console.log('BUFFER', buffer);
      let index = this.parseGziIndex(buffer);

      // Get file size
      const headResponse = await fetch(this.dataFileUrl, { method: 'HEAD' });
      const contentLength = Number(
        headResponse.headers.get('content-length') || '0'
      );

      console.log('Raw parsed index:', index.slice(0, 3)); // Show first few entries

      if (index.length === 0) {
        console.error('Index file contains no entries');
        throw new Error('Invalid index file - no entries found');
      }

      // Correct or rebuild the index if needed
      index = await this.ensureValidIndex(
        index,
        firstRealBlockOffset,
        contentLength
      );

      // Set size for the last block if not already set
      if (!index[index.length - 1].size) {
        index[index.length - 1].size =
          contentLength - index[index.length - 1].compressedOffset;
      }

      // Calculate block sizes
      for (let i = 0; i < index.length - 1; i++) {
        if (!index[i].size) {
          index[i].size =
            index[i + 1].compressedOffset - index[i].compressedOffset;
        }
      }

      // Verify first few blocks have reasonable sizes
      console.log(
        'Block sizes check:',
        index.slice(0, 3).map((b) => b.size)
      );

      this.gziIndex = index;
      console.log('CHECK OUT index ', index);
      this.fileStats = {
        totalSize: contentLength,
        totalBlocks: index.length,
        totalRecords: Math.floor(
          index[index.length - 1].uncompressedOffset / this.avgBytesPerRecord
        ),
      };

      this.isInitialized = true;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching GZI index:', errorMessage);
      this.errorHandler(`BGZip initialization error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get file statistics
   */
  public getFileStats(): FileStats {
    return { ...this.fileStats };
  }

  /**
   * Get the estimated total number of pages
   */
  public getTotalPages(pageSize: number): number {
    if (!this.fileStats.totalRecords) return 1;
    return Math.ceil(this.fileStats.totalRecords / pageSize);
  }

  /**
   * Fetch and decompress data for a specific page
   */
  // public async getPageData(page: number, pageSize: number): Promise<string> {
  //   console.log('Are we even loading the page?');
  //
  //   if (!this.isInitialized) {
  //     const success = await this.initialize();
  //     if (!success) {
  //       throw new Error('Failed to initialize BGZip service');
  //     }
  //   }
  //
  //   const blockIndices = this.getBlockIndicesForPage(page, pageSize);
  //   console.log('Block indices determined:', blockIndices);
  //
  //   // Fetch all needed blocks
  //   const blockDataPromises = blockIndices.map((idx) =>
  //     this.fetchBgzipBlock(idx)
  //   );
  //   console.log('blockIndices ', blockIndices);
  //   console.log(
  //     `Fetching ${blockIndices.length} blocks: ${blockIndices.join(', ')}`
  //   );
  //   const blockDataResults = await Promise.all(blockDataPromises);
  //
  //   console.log(`Received ${blockDataResults.length} block results`);
  //   console.log(
  //     `Block data valid: ${blockDataResults
  //       .map((block) => (block ? 'yes' : 'no'))
  //       .join(', ')}`
  //   );
  //   console.log('blockDataResults ', blockDataResults);
  //
  //   // Combine block data
  //   let allText = '';
  //   for (const blockData of blockDataResults) {
  //     if (blockData) {
  //       allText += blockData;
  //     }
  //   }
  //
  //   console.log('allText ', allText);
  //
  //   // Parse the TSV data
  //   const lines = allText.split('\n').filter((line) => line.trim() !== '');
  //   console.log('LINES LENGTH ', lines.length);
  //   console.log('Parsed full content:', lines);
  //
  //   return allText;
  // }

  public async getPageData(page: number, pageSize: number): Promise<string> {
    console.log('Loading page', page, 'with page size', pageSize);

    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize BGZip service');
      }
    }

    let blockIndices = this.getBlockIndicesForPage(page, pageSize);
    console.log(page);
    // blockIndices = [2, 1];
    console.log('Block indices determined:', blockIndices);

    // Fetch all needed blocks
    const blockDataPromises = blockIndices.map((idx) =>
      this.fetchBgzipBlock(idx)
    );
    console.log(
      `Fetching ${blockIndices.length} blocks: ${blockIndices.join(', ')}`
    );

    // Wait for all promises to settle, even if some fail
    const blockDataResults = await Promise.allSettled(blockDataPromises);

    // Filter only successful results
    const successfulBlocks = blockDataResults
      .filter(
        (result): result is PromiseFulfilledResult<string> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value);

    console.log(
      `Received ${successfulBlocks.length} successful blocks out of ${blockDataResults.length} requested`
    );

    // Combine block data from successful blocks only
    const allText = successfulBlocks.join('');

    // Handle empty results
    if (allText.trim() === '') {
      // If we're requesting a page beyond the first and got no data, fall back to first page
      if (page > 1) {
        this.logger(
          'No data found for requested page, falling back to first page'
        );
        return this.getPageData(1, pageSize);
      } else {
        throw new Error('Failed to load data: No valid blocks found');
      }
    }

    return allText;
  }

  /**
   * Release resources and reset state
   */
  public dispose(): void {
    this.gziIndex = [];
    this.isInitialized = false;
  }

  // --- Private methods ---

  private async examineFileStructure(): Promise<number | null> {
    try {
      const response = await fetch(this.dataFileUrl, {
        headers: { Range: 'bytes=0-4096' },
      });

      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);

      console.log(
        'File header bytes (first 50):',
        Array.from(data.slice(0, 50))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      );

      console.log(
        'File header bytes (second block):',
        Array.from(data.slice(50, 189))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      );

      // Look for gzip magic numbers
      const blockStarts = [];
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i] === 0x1f && data[i + 1] === 0x8b) {
          blockStarts.push(i);
          if (blockStarts.length >= 5) break;
        }
      }

      console.log('Found gzip blocks at positions:', blockStarts);
      return blockStarts.length > 0 ? blockStarts[0] : null;
    } catch (err) {
      this.errorHandler(`Error examining file structure: ${err}`);
      return null;
    }
  }

  private parseGziIndex(buffer: ArrayBuffer): GziBlock[] {
    const view = new DataView(buffer);
    const blocks: GziBlock[] = [];
    const headerOffset = 0;
    let offset = headerOffset;

    while (offset + 16 <= buffer.byteLength) {
      const compressedOffset = Number(view.getBigUint64(offset, true));
      offset += 8;
      const uncompressedOffset = Number(view.getBigUint64(offset, true));
      offset += 8;

      blocks.push({
        compressedOffset,
        uncompressedOffset,
      });
    }

    return blocks;
  }

  private async ensureValidIndex(
    index: GziBlock[],
    firstRealBlockOffset: number | null,
    contentLength: number
  ): Promise<GziBlock[]> {
    let indexIsValid = false;

    // Try correcting existing index
    if (
      firstRealBlockOffset !== null &&
      index.length > 0 &&
      firstRealBlockOffset !== index[0].compressedOffset
    ) {
      const correction = firstRealBlockOffset - index[0].compressedOffset;
      console.log(
        `Applying offset correction of ${correction} bytes to all blocks`
      );

      // Apply correction to all offsets
      const correctedIndex = index.map((block) => ({
        ...block,
        compressedOffset: block.compressedOffset + correction,
      }));

      console.log('Corrected first few entries:', correctedIndex.slice(0, 3));

      // Test if correction worked
      try {
        const testBlock = correctedIndex[0];
        const testResponse = await fetch(this.dataFileUrl, {
          headers: {
            Range: `bytes=${testBlock.compressedOffset}-${
              testBlock.compressedOffset + 10
            }`,
          },
        });

        const testData = new Uint8Array(await testResponse.arrayBuffer());
        if (testData[0] === 0x1f && testData[1] === 0x8b) {
          console.log('Index correction succeeded!');
          indexIsValid = true;
          return correctedIndex;
        } else {
          console.log('Index correction failed, rebuilding index from scratch');
        }
      } catch (e) {
        console.error('Error testing corrected index:', e);
      }
    }

    // If correction failed or wasn't needed, rebuild the index
    if (!indexIsValid) {
      console.log(
        'Rebuilding entire index by scanning file for gzip blocks...'
      );
      const blockStarts = await this.scanFileForBlocks(contentLength);

      if (blockStarts.length > 0) {
        const newIndex = blockStarts.map((offset, i) => {
          const nextOffset =
            i < blockStarts.length - 1 ? blockStarts[i + 1] : contentLength;
          return {
            compressedOffset: offset,
            uncompressedOffset: i * 65536, // Estimate
            size: nextOffset - offset,
          };
        });

        console.log(
          `Rebuilt index with ${newIndex.length} blocks, first few:`,
          newIndex.slice(0, 3)
        );

        return newIndex;
      }
    }

    return index;
  }

  private async scanFileForBlocks(contentLength: number): Promise<number[]> {
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    let offset = 0;
    const blockStarts = [];
    let bytesScanned = 0;

    // Limit scanning to 20MB or file size
    const maxScanBytes = Math.min(20 * 1024 * 1024, contentLength);

    while (bytesScanned < maxScanBytes) {
      const endByte = Math.min(offset + CHUNK_SIZE - 1, contentLength - 1);
      console.log(`Scanning bytes ${offset}-${endByte}...`);

      const response = await fetch(this.dataFileUrl, {
        headers: { Range: `bytes=${offset}-${endByte}` },
      });

      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);
      bytesScanned += data.length;

      // Find gzip headers
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i] === 0x1f && data[i + 1] === 0x8b) {
          blockStarts.push(offset + i);
          if (blockStarts.length >= 100) {
            console.log('Found 100 blocks, stopping scan for efficiency');
            return blockStarts;
          }
        }
      }

      offset += CHUNK_SIZE;

      if (blockStarts.length === 0 && bytesScanned >= 5 * 1024 * 1024) {
        console.warn('No gzip blocks found in first 5MB, stopping scan');
        break;
      }
    }

    console.log(`Found ${blockStarts.length} gzip blocks in scan`);
    return blockStarts;
  }

  private getBlockIndicesForPage(page: number, pageSize: number): number[] {
    console.log('PAGE SIZE', pageSize);
    if (!this.gziIndex || this.gziIndex.length === 0) return [];

    // Get total uncompressed size
    const totalUncompressedSize =
      this.gziIndex[this.gziIndex.length - 1].uncompressedOffset;

    // Add debugging
    console.log('Total uncompressed size:', totalUncompressedSize);
    console.log('Total blocks in index:', this.gziIndex.length);

    // Example calculation based on file stats
    const estimatedTotalRecords = Math.floor(
      totalUncompressedSize / this.gziIndex.length
    );
    const estimatedAvgBytes = totalUncompressedSize / estimatedTotalRecords;
    console.log('estimatedTotalRecords ', estimatedTotalRecords);
    console.log('estimatedAvgBytes ', estimatedAvgBytes);

    // For small files, just return all blocks
    // if (this.gziIndex.length < 10) {
    //   console.log('Small number of blocks, returning all');
    //   return Array.from({ length: this.gziIndex.length }, (_, i) => i);
    // }

    // Calculate which blocks we need for this page
    const recordsPerBlock = Math.floor(
      totalUncompressedSize / (this.avgBytesPerRecord * this.gziIndex.length)
    );
    console.log('Estimated records per block:', recordsPerBlock);

    let startRecord = (page - 1) * pageSize;
    let endRecord = Math.min(
      startRecord + pageSize - 1,
      totalUncompressedSize / this.avgBytesPerRecord
    );
    startRecord = 49;
    endRecord = 99;
    console.log('START RECORD ', startRecord);
    console.log('END RECORD ', endRecord);

    // Find block range for these records
    let startBlockIndex = Math.max(
      0,
      Math.floor(startRecord / recordsPerBlock)
    );
    let endBlockIndex = Math.min(
      this.gziIndex.length - 1,
      Math.ceil(endRecord / recordsPerBlock)
    );

    console.log('startBlockIndex ', startBlockIndex);
    console.log('endBlockIndex', endBlockIndex);

    // startBlockIndex = 49;
    //
    // endBlockIndex = 99;

    console.log(
      `Page ${page}: Records ${startRecord}-${endRecord}, Blocks ${startBlockIndex}-${endBlockIndex}`
    );

    // Create array of block indices
    const blocks = [];
    for (let i = startBlockIndex; i <= endBlockIndex; i++) {
      blocks.push(i);
    }

    // Safety check
    if (blocks.length === 0) {
      console.log('No blocks selected, defaulting to first block');
      return [0];
    }

    return blocks;
  }

  private async fetchBgzipBlock(blockIndex: number): Promise<string | null> {
    if (!this.gziIndex || blockIndex >= this.gziIndex.length) {
      throw new Error(`Invalid block index: ${blockIndex}`);
    }

    const block = this.gziIndex[blockIndex];
    if (!block.size) {
      throw new Error(`Block size not calculated for index: ${blockIndex}`);
    }

    try {
      console.log(
        `Fetching block ${blockIndex} (offset: ${block.compressedOffset}, size: ${block.size})`
      );

      // Scan for gzip header in this range
      const scanResponse = await fetch(this.dataFileUrl, {
        headers: {
          Range: `bytes=${block.compressedOffset}-${
            block.compressedOffset + Math.min(1024, block.size - 1)
          }`,
        },
      });

      const scanData = new Uint8Array(await scanResponse.arrayBuffer());
      let actualBlockStart = block.compressedOffset;
      let foundHeader = false;

      // Find the gzip header
      for (let i = 0; i < scanData.length - 1; i++) {
        if (scanData[i] === 0x1f && scanData[i + 1] === 0x8b) {
          actualBlockStart = block.compressedOffset + i;
          foundHeader = true;
          console.log(
            `Found gzip header for block ${blockIndex} at relative offset +${i}`
          );
          break;
        }
      }

      if (!foundHeader) {
        console.error(`No gzip header found in block ${blockIndex}`);
        this.errorHandler(`No gzip header found in block ${blockIndex}`);
        return null;
      }

      // Fetch block from the actual header start
      const response = await fetch(this.dataFileUrl, {
        headers: {
          Range: `bytes=${actualBlockStart}-${
            block.compressedOffset + block.size - 1
          }`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch block: ${response.status} ${response.statusText}`
        );
      }

      const compressedData = await response.arrayBuffer();
      const dataArray = new Uint8Array(compressedData);

      // Find next gzip header
      let blockEnd = dataArray.length;
      for (let i = 10; i < dataArray.length - 1; i++) {
        if (dataArray[i] === 0x1f && dataArray[i + 1] === 0x8b) {
          blockEnd = i;
          console.log(
            `Found next gzip header at offset +${i}, limiting block size`
          );
          break;
        }
      }

      // Use data up to the next header or end
      const blockData = dataArray.slice(0, blockEnd);

      console.log(`Processing block ${blockIndex}: ${blockData.length} bytes`);

      try {
        // Decompress the block
        const decompressed = pako.inflate(blockData, {
          to: 'string',
          chunkSize: 1024 * 1024,
        });

        // Handle both string and binary output
        let text;
        if (typeof decompressed === 'string') {
          text = decompressed;
        } else {
          text = new TextDecoder('utf-8').decode(decompressed);
        }

        console.log(
          `Block ${blockIndex} decompressed: ${
            text.length
          } chars, starts with: ${text.substring(0, 50)}`
        );
        return text;
      } catch (decompressError) {
        console.error(
          `Error decompressing block ${blockIndex}:`,
          decompressError
        );

        // Try to get more info about the data
        console.log(
          `First few bytes of block ${blockIndex}:`,
          Array.from(blockData.slice(0, 20))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ')
        );

        // Try alternative decompression for BGZip-specific formats
        try {
          console.log('Attempting alternative decompression approach...');
          // Parse header to find actual data
          let headerSize = 10;
          if ((blockData[3] & 0x04) !== 0) {
            const extraLen = blockData[10] + (blockData[11] << 8);
            headerSize += 2 + extraLen;
          }
          if ((blockData[3] & 0x08) !== 0) {
            let i = headerSize;
            while (i < blockData.length && blockData[i] !== 0) i++;
            headerSize = i + 1;
          }
          if ((blockData[3] & 0x10) !== 0) {
            let i = headerSize;
            while (i < blockData.length && blockData[i] !== 0) i++;
            headerSize = i + 1;
          }
          if ((blockData[3] & 0x02) !== 0) {
            headerSize += 2;
          }

          console.log(`Block ${blockIndex} header size: ${headerSize} bytes`);

          // Extract data without header/footer
          const compressedDataOnly = blockData.slice(
            headerSize,
            blockData.length - 8
          );

          console.log(
            `Block ${blockIndex} compressed data size: ${compressedDataOnly.length} bytes`
          );

          const decompressed = pako.inflate(compressedDataOnly, {
            windowBits: -15,
          });

          const text = new TextDecoder('utf-8').decode(decompressed);
          console.log(
            `Alternative decompression succeeded: ${text.length} chars`
          );
          return text;
        } catch (altError) {
          console.error('Alternative decompression also failed:', altError);
          this.errorHandler(
            `Alternative decompression also failed: ${altError}`
          );
          return null;
        }
      }
    } catch (err) {
      console.error(`Error fetching block ${blockIndex}:`, err);
      this.errorHandler(`Error fetching block ${blockIndex}: ${err}`);
      return null;
    }
  }
}
