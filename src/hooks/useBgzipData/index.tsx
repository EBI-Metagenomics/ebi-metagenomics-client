// hooks/useBGZip.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import * as pako from 'pako';

// --- Types ---
interface GziBlock {
  compressedOffset: number;
  uncompressedOffset: number;
  size?: number;
}

interface FileStats {
  totalSize: number;
  totalBlocks: number;
  totalRecords: number | null;
}

export interface BGZipOptions<T> {
  pageSize?: number;
  avgBytesPerRecord?: number;
  parseFunction: (text: string) => T[];
  onError?: (error: string) => void;
}

export interface BGZipResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  fileStats: FileStats;
  loadPage: (page: number) => Promise<void>;
  reload: () => Promise<void>;
}

// --- Main Hook ---
export function useBGZipData<T>(
  dataFileUrl: string,
  indexFileUrl: string,
  options: BGZipOptions<T>
): BGZipResult<T> {
  const {
    pageSize = 50,
    avgBytesPerRecord = 100,
    parseFunction,
    onError,
  } = options;

  // State
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [gziIndex, setGziIndex] = useState<GziBlock[]>([]);
  const [fileStats, setFileStats] = useState<FileStats>({
    totalSize: 0,
    totalBlocks: 0,
    totalRecords: null,
  });

  // Refs to prevent unnecessary re-renders and fetches
  const initialLoadRef = useRef(false);
  const gziIndexRef = useRef<GziBlock[]>([]);
  const optionsRef = useRef(options);
  const urlsRef = useRef({ dataFileUrl, indexFileUrl });

  // Update refs when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    urlsRef.current = { dataFileUrl, indexFileUrl };
  }, [dataFileUrl, indexFileUrl]);

  // Store gziIndex in ref to prevent dependency cycle
  useEffect(() => {
    gziIndexRef.current = gziIndex;
  }, [gziIndex]);

  // --- Helper Functions ---

  // Parse GZI index file - stable reference
  const parseGziIndex = useCallback((buffer: ArrayBuffer): GziBlock[] => {
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
  }, []);

  // Fetch and process GZI index - memoized with stable dependencies
  const fetchGziIndex = useCallback(async (): Promise<GziBlock[] | null> => {
    try {
      const { dataFileUrl, indexFileUrl } = urlsRef.current;
      const { avgBytesPerRecord, pageSize, onError } = optionsRef.current;

      // First, scan for actual gzip blocks
      const examineFileStructure = async () => {
        // Request the first few KB to examine the file header
        const response = await fetch(dataFileUrl, {
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

        // Look for gzip magic numbers in first 4KB
        const blockStarts = [];
        for (let i = 0; i < data.length - 1; i++) {
          if (data[i] === 0x1f && data[i + 1] === 0x8b) {
            blockStarts.push(i);
            if (blockStarts.length >= 5) break; // Find first 5 blocks
          }
        }

        console.log('Found gzip blocks at positions:', blockStarts);
        return blockStarts.length > 0 ? blockStarts[0] : null;
      };

      // Find the actual first block offset
      const firstRealBlockOffset = await examineFileStructure();
      console.log('First real gzip block offset:', firstRealBlockOffset);

      // Fetch and parse the index file
      const response = await fetch(indexFileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch index file: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      let index = parseGziIndex(buffer);

      // Get file size to determine the size of the last block
      const headResponse = await fetch(dataFileUrl, { method: 'HEAD' });
      const contentLength = Number(
        headResponse.headers.get('content-length') || '0'
      );

      console.log('Raw parsed index:', index.slice(0, 3)); // Show first few entries

      if (index.length === 0) {
        console.error('Index file contains no entries');
        throw new Error('Invalid index file - no entries found');
      }

      let indexIsValid = false;

      // First try correcting the existing index
      if (
        firstRealBlockOffset !== null &&
        index.length > 0 &&
        firstRealBlockOffset !== index[0].compressedOffset
      ) {
        const correction = firstRealBlockOffset - index[0].compressedOffset;
        console.log(
          `Applying offset correction of ${correction} bytes to all blocks`
        );

        index = index.map((block) => ({
          ...block,
          compressedOffset: block.compressedOffset + correction,
        }));

        console.log('Corrected first few entries:', index.slice(0, 3));

        // Test if correction worked by fetching the first block
        try {
          const testBlock = index[0];
          const testResponse = await fetch(dataFileUrl, {
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
          } else {
            console.log(
              'Index correction failed, rebuilding index from scratch'
            );
          }
        } catch (e) {
          console.error('Error testing corrected index:', e);
        }
      }

      // If correction failed or wasn't needed, rebuild the index completely
      if (!indexIsValid) {
        console.log(
          'Rebuilding entire index by scanning file for gzip blocks...'
        );

        // Function to scan a large portion of the file for all gzip headers
        const scanEntireFileForBlocks = async () => {
          // Request chunks in segments to avoid loading entire file
          const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
          let offset = 0;
          const blockStarts = [];
          let bytesScanned = 0;

          // Limit scanning to first 20MB or content length
          const maxScanBytes = Math.min(20 * 1024 * 1024, contentLength);

          while (bytesScanned < maxScanBytes) {
            const endByte = Math.min(
              offset + CHUNK_SIZE - 1,
              contentLength - 1
            );
            console.log(`Scanning bytes ${offset}-${endByte}...`);

            const response = await fetch(dataFileUrl, {
              headers: { Range: `bytes=${offset}-${endByte}` },
            });

            const buffer = await response.arrayBuffer();
            const data = new Uint8Array(buffer);
            bytesScanned += data.length;

            // Find all gzip block starts in this chunk
            for (let i = 0; i < data.length - 1; i++) {
              if (data[i] === 0x1f && data[i + 1] === 0x8b) {
                blockStarts.push(offset + i);

                // Limit number of blocks for performance in development
                if (blockStarts.length >= 100) {
                  console.log('Found 100 blocks, stopping scan for efficiency');
                  return blockStarts;
                }
              }
            }

            offset += CHUNK_SIZE;

            // Prevent infinite loop
            if (blockStarts.length === 0 && bytesScanned >= 5 * 1024 * 1024) {
              console.warn('No gzip blocks found in first 5MB, stopping scan');
              break;
            }
          }

          console.log(`Found ${blockStarts.length} gzip blocks in scan`);
          return blockStarts;
        };

        // Scan file and rebuild index
        const realBlocks = await scanEntireFileForBlocks();

        if (realBlocks.length > 0) {
          // Create new index using actual block positions
          index = realBlocks.map((offset, i) => {
            const nextOffset =
              i < realBlocks.length - 1 ? realBlocks[i + 1] : contentLength;
            return {
              compressedOffset: offset,
              uncompressedOffset: i * 65536, // Estimate uncompressed size
              size: nextOffset - offset,
            };
          });

          console.log(
            `Rebuilt index with ${index.length} blocks, first few:`,
            index.slice(0, 3)
          );
          indexIsValid = true;
        } else {
          throw new Error('Could not locate any valid gzip blocks in file');
        }
      }

      // Continue with the existing code
      if (contentLength > 0 && index.length > 0 && indexIsValid) {
        // Set size for the last block if not already set
        if (!index[index.length - 1].size) {
          index[index.length - 1].size =
            contentLength - index[index.length - 1].compressedOffset;
        }

        // Verify sizes for all blocks
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

        setGziIndex(index);
        setFileStats({
          totalSize: contentLength,
          totalBlocks: index.length,
          totalRecords: null,
        });

        // Estimate total records and pages
        const estimatedTotalRecords = Math.floor(
          index[index.length - 1].uncompressedOffset / avgBytesPerRecord
        );
        setFileStats((prev) => ({
          ...prev,
          totalRecords: estimatedTotalRecords,
        }));
        setTotalPages(Math.ceil(estimatedTotalRecords / pageSize));

        return index;
      } else {
        throw new Error('Invalid index file or unable to determine file size');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching GZI index:', errorMessage);
      setError(errorMessage);
      if (optionsRef.current.onError) optionsRef.current.onError(errorMessage);
      return null;
    }
  }, [parseGziIndex]); // Minimized dependencies

  // Fetch and decompress a specific BGZip block - use refs to prevent dependency cycles
  const fetchBgzipBlock = useCallback(
    async (blockIndex: number): Promise<string | null> => {
      const index = gziIndexRef.current;
      const { dataFileUrl } = urlsRef.current;

      if (!index || blockIndex >= index.length) {
        throw new Error(`Invalid block index: ${blockIndex}`);
      }

      const block = index[blockIndex];
      if (!block.size) {
        throw new Error(`Block size not calculated for index: ${blockIndex}`);
      }

      try {
        console.log(
          `Fetching block ${blockIndex} (offset: ${block.compressedOffset}, size: ${block.size})`
        );

        // FIRST MODIFICATION: Scan for gzip header within this range
        const scanResponse = await fetch(dataFileUrl, {
          headers: {
            Range: `bytes=${block.compressedOffset}-${
              block.compressedOffset + Math.min(1024, block.size - 1)
            }`,
          },
        });

        const scanData = new Uint8Array(await scanResponse.arrayBuffer());
        let actualBlockStart = block.compressedOffset;
        let foundHeader = false;

        // Look for gzip magic numbers in the first 1KB of the supposed block
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
          return null;
        }

        // SECOND MODIFICATION: Fetch block from the actual gzip header start
        // Also, look for the NEXT gzip header to determine the true block size
        const response = await fetch(dataFileUrl, {
          headers: {
            Range: `bytes=${actualBlockStart}-${
              block.compressedOffset + block.size - 1
            }`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch block data: ${response.status} ${response.statusText}`
          );
        }

        const compressedData = await response.arrayBuffer();
        const dataArray = new Uint8Array(compressedData);

        // Find next gzip header to determine the true block end
        let blockEnd = dataArray.length;
        for (let i = 10; i < dataArray.length - 1; i++) {
          // Start after header (10+ bytes)
          if (dataArray[i] === 0x1f && dataArray[i + 1] === 0x8b) {
            blockEnd = i;
            console.log(
              `Found next gzip header at offset +${i}, limiting block size`
            );
            break;
          }
        }

        // Use only data up to the next gzip header (or end if none found)
        const blockData = dataArray.slice(0, blockEnd);

        console.log(
          `Processing block ${blockIndex}: ${blockData.length} bytes`
        );

        try {
          // Use additional options for decompression
          const inflateOptions = {
            to: 'string',
            chunkSize: 1024 * 1024, // 1MB chunks
          };

          const decompressed = pako.inflate(blockData, inflateOptions);
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

          // Try BGZip specific header parsing approach
          try {
            console.log('Attempting alternative decompression approach...');
            // For BGZip, we need to extract the actual compressed data by skipping the header
            // The header size is variable, but we can find it by looking at the flags
            let headerSize = 10; // Minimum gzip header size

            // Check if extra field exists (bit 2 in flags byte)
            if ((blockData[3] & 0x04) !== 0) {
              // Extra field exists, get its length
              const extraLen = blockData[10] + (blockData[11] << 8);
              headerSize += 2 + extraLen; // 2 bytes for length field + extra field data
            }

            // Check for filename field (bit 3 in flags byte)
            if ((blockData[3] & 0x08) !== 0) {
              // Find the zero terminator for the filename
              let i = headerSize;
              while (i < blockData.length && blockData[i] !== 0) i++;
              headerSize = i + 1; // Include the zero terminator
            }

            // Check for comment field (bit 4 in flags byte)
            if ((blockData[3] & 0x10) !== 0) {
              // Find the zero terminator for the comment
              let i = headerSize;
              while (i < blockData.length && blockData[i] !== 0) i++;
              headerSize = i + 1; // Include the zero terminator
            }

            // Check for header CRC (bit 1 in flags byte)
            if ((blockData[3] & 0x02) !== 0) {
              headerSize += 2; // 2 bytes for CRC16
            }

            console.log(`Block ${blockIndex} header size: ${headerSize} bytes`);

            // Extract the actual compressed data without the header
            // Also remove the 8-byte footer (4 bytes CRC32, 4 bytes size)
            const compressedDataOnly = blockData.slice(
              headerSize,
              blockData.length - 8
            );

            console.log(
              `Block ${blockIndex} compressed data size: ${compressedDataOnly.length} bytes`
            );

            // Try to decompress the data using pako's raw inflate mode
            const decompressed = pako.inflate(compressedDataOnly, {
              windowBits: -15, // Negative value means raw deflate data with no header/footer
            });

            // Convert to string
            const text = new TextDecoder('utf-8').decode(decompressed);
            console.log(
              `Alternative decompression succeeded: ${text.length} chars`
            );
            return text;
          } catch (altError) {
            console.error('Alternative decompression also failed:', altError);
            return null;
          }
        }
      } catch (err) {
        console.error(`Error fetching block ${blockIndex}:`, err);
        return null;
      }
    },
    [] // No dependencies, using refs instead
  );

  // Determine which blocks to fetch for a specific page - use refs to prevent dependency cycles
  const getBlockIndicesForPage = useCallback(
    (page: number, itemsPerPage: number): number[] => {
      const index = gziIndexRef.current;
      const { avgBytesPerRecord } = optionsRef.current;

      if (!index || index.length === 0) return [];

      // Get total uncompressed size from the last block
      const totalUncompressedSize = index[index.length - 1].uncompressedOffset;

      // Add debugging
      console.log('Total uncompressed size:', totalUncompressedSize);
      console.log('Total blocks in index:', index.length);

      // Example calculation based on file stats
      const estimatedTotalRecords = Math.floor(
        totalUncompressedSize / index.length
      );
      const estimatedAvgBytes = totalUncompressedSize / estimatedTotalRecords;
      console.log('estimatedTotalRecords ', estimatedTotalRecords);
      console.log('estimatedAvgBytes ', estimatedAvgBytes);

      // Simple approach: for small number of blocks, just return all of them
      if (index.length < 10) {
        console.log('Small number of blocks, returning all');
        return Array.from({ length: index.length }, (_, i) => i);
      }

      // If more precise mapping is needed:
      const recordsPerBlock = Math.floor(
        totalUncompressedSize / (avgBytesPerRecord * index.length)
      );
      console.log('Estimated records per block:', recordsPerBlock);

      const startRecord = (page - 1) * itemsPerPage;
      const endRecord = Math.min(
        startRecord + itemsPerPage - 1,
        totalUncompressedSize / avgBytesPerRecord
      );

      // Calculate which blocks we need
      const startBlockIndex = Math.max(
        0,
        Math.floor(startRecord / recordsPerBlock)
      );
      const endBlockIndex = Math.min(
        index.length - 1,
        Math.ceil(endRecord / recordsPerBlock)
      );

      console.log(
        `Page ${page}: Records ${startRecord}-${endRecord}, Blocks ${startBlockIndex}-${endBlockIndex}`
      );

      // Create array of block indices
      const blocks = [];
      for (let i = startBlockIndex; i <= endBlockIndex; i++) {
        blocks.push(i);
      }

      // Safeguard: if no blocks were selected, return the first block
      if (blocks.length === 0) {
        console.log('No blocks selected, defaulting to first block');
        return [0];
      }

      return blocks;
    },
    [] // No dependencies, using refs instead
  );

  // Load data for a specific page - use memoized value with minimized dependencies
  const loadPage = useCallback(
    async (page: number) => {
      // if (isLoading) {
      //   console.log('Already loading, skipping duplicate request');
      //   return;
      // }

      setIsLoading(true);
      setError(null);

      try {
        const { pageSize, parseFunction, onError } = optionsRef.current;

        // If gziIndex not loaded yet, fetch it first
        if (!gziIndexRef.current || gziIndexRef.current.length === 0) {
          console.log('Index not loaded, fetching index first');
          const index = await fetchGziIndex();
          if (!index) {
            throw new Error('Failed to load index file');
          }
        }

        const blockIndices = getBlockIndicesForPage(page, pageSize);
        console.log('Block indices determined:', blockIndices);

        // Fetch all needed blocks
        const blockDataPromises = blockIndices.map((idx) =>
          fetchBgzipBlock(idx)
        );
        console.log(
          `Fetching ${blockIndices.length} blocks: ${blockIndices.join(', ')}`
        );
        const blockDataResults = await Promise.all(blockDataPromises);

        console.log(`Received ${blockDataResults.length} block results`);

        // Combine and parse block data
        let allText = '';
        for (const blockData of blockDataResults) {
          if (blockData) {
            allText += blockData;
          }
        }

        // Parse the data using the provided parse function
        const parsedData = parseFunction(allText);

        setData(parsedData);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error loading page:', errorMessage);
        setError(errorMessage);
        if (optionsRef.current.onError)
          optionsRef.current.onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchGziIndex, getBlockIndicesForPage, fetchBgzipBlock, isLoading] // Minimized dependencies
  );

  // Reload current page (useful after changing parse function)
  const reload = useCallback(() => {
    return loadPage(currentPage);
  }, [loadPage, currentPage]);

  // Initial load - use ref to ensure it only runs once
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      console.log('Initial load - fetching first page');
      loadPage(1);
    }
  }, [loadPage]);

  // Return the hook API
  return {
    data,
    isLoading,
    error,
    currentPage,
    totalPages,
    fileStats,
    loadPage,
    reload,
  };
}
