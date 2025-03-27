import React, { useState, useEffect, useCallback } from 'react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import * as pako from 'pako';

// Define pathway data interface
interface KOPathway {
  classId: string;
  name: string;
  description: string;
  completeness: number;
  matchingKO: string;
  missingKOs: string;
}

// GZI index block structure
interface GziBlock {
  compressedOffset: number;
  uncompressedOffset: number;
  size?: number; // Calculated from consecutive blocks
}

const KOTab: React.FC = () => {
  const [koPathwayData, setKoPathwayData] = useState<KOPathway[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(50);
  const [gziIndex, setGziIndex] = useState<GziBlock[]>([]);
  const [fileStats, setFileStats] = useState<{
    totalSize: number;
    totalBlocks: number;
    totalRecords: number | null;
  }>({
    totalSize: 0,
    totalBlocks: 0,
    totalRecords: null,
  });

  // Base URL for the data file
  // const baseUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly';
  // const dataFileUrl = `${baseUrl}/new.tsv.gz`;
  // const indexFileUrl = `${baseUrl}/new.tsv.gz.gzi`;

  // const dataFileUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/large_assem_2.tsv.gz';
  // const indexFileUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/large_assem_2.tsv.gz.gzi';

  const dataFileUrl =
    'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_summary_kegg_pathways.tsv.gz';
  const indexFileUrl =
    'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_summary_kegg_pathways.tsv.gz.gzi';

  // Estimate for average bytes per record - adjust based on your data
  const avgBytesPerRecord = 100; // Rough estimate - should be tuned based on actual data

  // const examineFileStructure = async () => {
  //   // Request the first 100 bytes to examine the file header
  //   const response = await fetch(dataFileUrl, {
  //     headers: { Range: 'bytes=0-100' },
  //   });
  //
  //   const buffer = await response.arrayBuffer();
  //   const data = new Uint8Array(buffer);
  //
  //   console.log(
  //     'File header bytes:',
  //     Array.from(data)
  //       .map((b) => b.toString(16).padStart(2, '0'))
  //       .join(' ')
  //   );
  //
  //   // Look for gzip magic numbers
  //   for (let i = 0; i < data.length - 1; i++) {
  //     if (data[i] === 0x1f && data[i + 1] === 0x8b) {
  //       console.log(`Found gzip header at offset ${i}`);
  //       break;
  //     }
  //   }
  // };

  const findAllGzipBlocks = async () => {
    // Request the first chunk of the file
    const response = await fetch(dataFileUrl);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Find all gzip block starts in the first 10KB
    const blockStarts = [];
    for (let i = 0; i < Math.min(data.length - 1, 10000); i++) {
      if (data[i] === 0x1f && data[i + 1] === 0x8b) {
        blockStarts.push(i);
      }
    }

    console.log('Found gzip blocks at positions:', blockStarts);
    return blockStarts[0]; // Return the first block position
  };

  const parseGziIndex = useCallback((buffer: ArrayBuffer): GziBlock[] => {
    const view = new DataView(buffer);
    const blocks: GziBlock[] = [];

    // For BGZip files, there's often metadata before the first block
    // The value 3411 appearing in logs could be metadata or a header size
    const headerOffset = 0; // Adjust based on your file examination
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

  // // Function to parse GZI index file
  // const parseGziIndex = useCallback((buffer: ArrayBuffer): GziBlock[] => {
  //   const view = new DataView(buffer);
  //   const blocks: GziBlock[] = [];
  //   let offset = 0;
  //
  //   while (offset + 16 <= buffer.byteLength) {
  //     const compressedOffset = Number(view.getBigUint64(offset, true)); // true for little-endian
  //     offset += 8;
  //     const uncompressedOffset = Number(view.getBigUint64(offset, true));
  //     offset += 8;
  //
  //     blocks.push({
  //       compressedOffset,
  //       uncompressedOffset,
  //     });
  //   }
  //
  //   // Calculate block sizes based on consecutive offsets
  //   for (let i = 0; i < blocks.length - 1; i++) {
  //     blocks[i].size =
  //       blocks[i + 1].compressedOffset - blocks[i].compressedOffset;
  //   }
  //
  //   // get index of where second block starts - 1
  //   // this gives the size of the first block
  //
  //   return blocks;
  // }, []);

  // Fetch the GZI index file
  // const fetchGziIndex = useCallback(async () => {
  //   try {
  //     const response = await fetch(indexFileUrl);
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to fetch index file: ${response.status} ${response.statusText}`
  //       );
  //     }
  //
  //     const buffer = await response.arrayBuffer();
  //     console.log('BUFFER', buffer);
  //     const index = parseGziIndex(buffer);
  //
  //     // Get file size to determine the size of the last block
  //     const headResponse = await fetch(dataFileUrl, { method: 'HEAD' });
  //     const contentLength = Number(
  //       headResponse.headers.get('content-length') || '0'
  //     );
  //
  //     console.log('Parsed index:', index);
  //     if (index.length === 0) {
  //       console.error('Index file contains no entries');
  //       throw new Error('Invalid index file - no entries found');
  //     }
  //
  //     if (contentLength > 0 && index.length > 0) {
  //       // Set size for the last block
  //       index[index.length - 1].size =
  //         contentLength - index[index.length - 1].compressedOffset;
  //
  //       setGziIndex(index);
  //       setFileStats({
  //         totalSize: contentLength,
  //         totalBlocks: index.length,
  //         totalRecords: null, // We'll estimate this later
  //       });
  //
  //       // Estimate total records and pages
  //       const estimatedTotalRecords = Math.floor(
  //         index[index.length - 1].uncompressedOffset / 100
  //       ); // Rough estimate
  //       setFileStats((prev) => ({
  //         ...prev,
  //         totalRecords: estimatedTotalRecords,
  //       }));
  //       setTotalPages(Math.ceil(estimatedTotalRecords / pageSize));
  //
  //       return index;
  //     } else {
  //       throw new Error('Invalid index file or unable to determine file size');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching GZI index:', err);
  //     setError(
  //       `Failed to load index file: ${
  //         err instanceof Error ? err.message : String(err)
  //       }`
  //     );
  //     return null;
  //   }
  // }, [indexFileUrl, dataFileUrl, pageSize, parseGziIndex]);

  // const fetchGziIndex = useCallback(async () => {
  //   try {
  //     // First, let's examine the file structure to find actual gzip blocks
  //     const examineFileStructure = async () => {
  //       // Request the first few KB to examine the file header
  //       const response = await fetch(dataFileUrl, {
  //         headers: { Range: 'bytes=0-4096' },
  //       });
  //
  //       const buffer = await response.arrayBuffer();
  //       const data = new Uint8Array(buffer);
  //
  //       console.log(
  //         'File header bytes (first 50):',
  //         Array.from(data.slice(0, 50))
  //           .map((b) => b.toString(16).padStart(2, '0'))
  //           .join(' ')
  //       );
  //
  //       // Look for gzip magic numbers in first 4KB
  //       const blockStarts = [];
  //       for (let i = 0; i < data.length - 1; i++) {
  //         if (data[i] === 0x1f && data[i + 1] === 0x8b) {
  //           blockStarts.push(i);
  //           if (blockStarts.length >= 5) break; // Find first 5 blocks
  //         }
  //       }
  //
  //       console.log('Found gzip blocks at positions:', blockStarts);
  //       return blockStarts.length > 0 ? blockStarts[0] : null;
  //     };
  //
  //     // Find the actual first block offset
  //     const firstRealBlockOffset = await examineFileStructure();
  //     console.log('First real gzip block offset:', firstRealBlockOffset);
  //
  //     // Fetch and parse the index file
  //     const response = await fetch(indexFileUrl);
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to fetch index file: ${response.status} ${response.statusText}`
  //       );
  //     }
  //
  //     const buffer = await response.arrayBuffer();
  //     let index = parseGziIndex(buffer);
  //
  //     // Get file size to determine the size of the last block
  //     const headResponse = await fetch(dataFileUrl, { method: 'HEAD' });
  //     const contentLength = Number(
  //       headResponse.headers.get('content-length') || '0'
  //     );
  //
  //     console.log('Raw parsed index:', index.slice(0, 3)); // Show first few entries
  //
  //     if (index.length === 0) {
  //       console.error('Index file contains no entries');
  //       throw new Error('Invalid index file - no entries found');
  //     }
  //
  //     // Apply correction to offsets if needed
  //     if (
  //       firstRealBlockOffset !== null &&
  //       index.length > 0 &&
  //       firstRealBlockOffset !== index[0].compressedOffset
  //     ) {
  //       const correction = firstRealBlockOffset - index[0].compressedOffset;
  //       console.log(
  //         `Applying offset correction of ${correction} bytes to all blocks`
  //       );
  //
  //       index = index.map((block) => ({
  //         ...block,
  //         compressedOffset: block.compressedOffset + correction,
  //       }));
  //
  //       console.log('Corrected first few entries:', index.slice(0, 3));
  //     }
  //
  //     if (contentLength > 0 && index.length > 0) {
  //       // Set size for the last block
  //       index[index.length - 1].size =
  //         contentLength - index[index.length - 1].compressedOffset;
  //
  //       // Calculate sizes for all blocks based on consecutive offsets
  //       for (let i = 0; i < index.length - 1; i++) {
  //         index[i].size =
  //           index[i + 1].compressedOffset - index[i].compressedOffset;
  //       }
  //
  //       // Verify first few blocks have reasonable sizes
  //       console.log(
  //         'Block sizes check:',
  //         index.slice(0, 3).map((b) => b.size)
  //       );
  //
  //       setGziIndex(index);
  //       setFileStats({
  //         totalSize: contentLength,
  //         totalBlocks: index.length,
  //         totalRecords: null, // We'll estimate this later
  //       });
  //
  //       // Estimate total records and pages
  //       const estimatedTotalRecords = Math.floor(
  //         index[index.length - 1].uncompressedOffset / 100
  //       ); // Rough estimate
  //       setFileStats((prev) => ({
  //         ...prev,
  //         totalRecords: estimatedTotalRecords,
  //       }));
  //       setTotalPages(Math.ceil(estimatedTotalRecords / pageSize));
  //
  //       return index;
  //     } else {
  //       throw new Error('Invalid index file or unable to determine file size');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching GZI index:', err);
  //     setError(
  //       `Failed to load index file: ${
  //         err instanceof Error ? err.message : String(err)
  //       }`
  //     );
  //     return null;
  //   }
  // }, [indexFileUrl, dataFileUrl, pageSize, parseGziIndex]);

  const fetchGziIndex = useCallback(async () => {
    try {
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

        console.log(
          'File header bytes (second block):',
          Array.from(data.slice(90, 168))
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

      // ------------------------
      // Add index rebuilding here as fallback
      // ------------------------

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
          totalRecords: null, // We'll estimate this later
        });

        // Estimate total records and pages
        const estimatedTotalRecords = Math.floor(
          index[index.length - 1].uncompressedOffset / 100
        ); // Rough estimate
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
      console.error('Error fetching GZI index:', err);
      setError(
        `Failed to load index file: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return null;
    }
  }, [indexFileUrl, dataFileUrl, pageSize, parseGziIndex]);

  const fetchBgzipBlock = useCallback(
    async (blockIndex: number): Promise<string | null> => {
      if (!gziIndex || blockIndex >= gziIndex.length) {
        throw new Error(`Invalid block index: ${blockIndex}`);
      }

      const block = gziIndex[blockIndex];
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
          return null;
        }
      } catch (err) {
        console.error(`Error fetching block ${blockIndex}:`, err);
        return null;
      }
    },
    [gziIndex, dataFileUrl]
  );

  // const fetchBgzipBlock = useCallback(
  //   async (blockIndex: number): Promise<string | null> => {
  //     if (!gziIndex || blockIndex >= gziIndex.length) {
  //       throw new Error(`Invalid block index: ${blockIndex}`);
  //     }
  //
  //     const block = gziIndex[blockIndex];
  //     if (!block.size) {
  //       throw new Error(`Block size not calculated for index: ${blockIndex}`);
  //     }
  //
  //     try {
  //       console.log(
  //         `Fetching block ${blockIndex} (offset: ${block.compressedOffset}, size: ${block.size})`
  //       );
  //
  //       // Make sure we're including the WHOLE gzip block
  //       const response = await fetch(dataFileUrl, {
  //         headers: {
  //           Range: `bytes=${block.compressedOffset}-${
  //             block.compressedOffset + block.size - 1
  //           }`,
  //         },
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error(
  //           `Failed to fetch block data: ${response.status} ${response.statusText}`
  //         );
  //       }
  //
  //       const compressedData = await response.arrayBuffer();
  //       console.log(
  //         `Received ${compressedData.byteLength} bytes for block ${blockIndex}`
  //       );
  //
  //       // Check if this looks like a valid gzip block
  //       const firstBytes = new Uint8Array(compressedData.slice(0, 4));
  //       console.log('FIRST BYTES', firstBytes[0]);
  //       if (firstBytes[0] !== 0x1f || firstBytes[1] !== 0x8b) {
  //         console.error(
  //           `Block ${blockIndex} doesn't start with gzip magic number`
  //         );
  //         return null;
  //       }
  //
  //       try {
  //         // Try to decompress using pako
  //         const inflateOptions = {
  //           to: 'string',
  //           chunkSize: 1024 * 1024, // 1MB chunks for large blocks
  //         };
  //
  //         console.log(
  //           `Decompressing block ${blockIndex} (${compressedData.byteLength} bytes)`
  //         );
  //         const decompressed = pako.inflate(
  //           new Uint8Array(compressedData),
  //           inflateOptions
  //         );
  //
  //         // If we're getting binary output instead of string
  //         let text;
  //         if (typeof decompressed === 'string') {
  //           text = decompressed;
  //         } else {
  //           text = new TextDecoder('utf-8').decode(decompressed);
  //         }
  //
  //         console.log(
  //           `Block ${blockIndex} decompressed successfully: ${text.length} chars`
  //         );
  //         return text;
  //       } catch (decompressError) {
  //         console.error(
  //           `Error decompressing block ${blockIndex}:`,
  //           decompressError
  //         );
  //
  //         // Try to get more info about the data
  //         console.log(
  //           `First few bytes of block ${blockIndex}:`,
  //           Array.from(new Uint8Array(compressedData.slice(0, 20)))
  //             .map((b) => b.toString(16).padStart(2, '0'))
  //             .join(' ')
  //         );
  //
  //         // Try a different approach - gunzip-web or other libraries may work better
  //         // If available, you might try:
  //         // const gunzip = new Gunzip();
  //         // const decompressed = gunzip.decompress(compressedData);
  //
  //         return null;
  //       }
  //     } catch (err) {
  //       console.error(`Error fetching block ${blockIndex}:`, err);
  //       return null;
  //     }
  //   },
  //   [gziIndex, dataFileUrl]
  // );

  // Fetch a specific BGZip block by its index
  // const fetchBgzipBlock = useCallback(
  //   async (blockIndex: number): Promise<string | null> => {
  //     if (!gziIndex || blockIndex >= gziIndex.length) {
  //       throw new Error(`Invalid block index: ${blockIndex}`);
  //     }
  //
  //     const block = gziIndex[blockIndex];
  //     if (!block.size) {
  //       throw new Error(`Block size not calculated for index: ${blockIndex}`);
  //     }
  //
  //     try {
  //       const response = await fetch(dataFileUrl, {
  //         headers: {
  //           Range: `bytes=${block.compressedOffset}-${
  //             block.compressedOffset + block.size - 1
  //           }`,
  //         },
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error(
  //           `Failed to fetch block data: ${response.status} ${response.statusText}`
  //         );
  //       }
  //
  //       const compressedData = await response.arrayBuffer();
  //
  //       try {
  //         // Decompress the block
  //         console.log(
  //           `Decompressing block ${blockIndex} (${compressedData.byteLength} bytes)`
  //         );
  //         const decompressed = pako.inflate(new Uint8Array(compressedData));
  //         const text = new TextDecoder('utf-8').decode(decompressed);
  //         console.log(
  //           `Block ${blockIndex} decompressed successfully: ${text.length} chars`
  //         );
  //         return text;
  //       } catch (decompressError) {
  //         console.error(
  //           `Error decompressing block ${blockIndex}:`,
  //           decompressError
  //         );
  //         // Try to get more info about the data
  //         console.log(
  //           `First few bytes of block ${blockIndex}:`,
  //           Array.from(new Uint8Array(compressedData.slice(0, 20)))
  //             .map((b) => b.toString(16).padStart(2, '0'))
  //             .join(' ')
  //         );
  //         return null;
  //       }
  //
  //       // try {
  //       //   // Decompress the block
  //       //   console.log(
  //       //     `Decompressing block ${blockIndex} (${compressedData.byteLength} bytes)`
  //       //   );
  //       //   const decompressed = pako.inflate(new Uint8Array(compressedData));
  //       //   return new TextDecoder('utf-8').decode(decompressed);
  //       // } catch (decompressError) {
  //       //   console.error('Error decompressing block:', decompressError);
  //       //   return null;
  //       // }
  //     } catch (err) {
  //       console.error(`Error fetching block ${blockIndex}:`, err);
  //       return null;
  //     }
  //   },
  //   [gziIndex, dataFileUrl]
  // );

  // Modify your getBlockIndicesForPage function to ensure it returns some blocks
  const getBlockIndicesForPage = useCallback(
    (page: number, itemsPerPage: number): number[] => {
      if (!gziIndex || gziIndex.length === 0) return [];

      // Get total uncompressed size from the last block
      const totalUncompressedSize =
        gziIndex[gziIndex.length - 1].uncompressedOffset;

      // Add debugging
      console.log('Total uncompressed size:', totalUncompressedSize);
      console.log('Total blocks in index:', gziIndex.length);

      // Example calculation based on file stats
      const estimatedTotalRecords = Math.floor(
        totalUncompressedSize / gziIndex.length
      );
      const estimatedAvgBytes = totalUncompressedSize / estimatedTotalRecords;
      console.log('estimatedTotalRecords ', estimatedTotalRecords);
      console.log('estimatedAvgBytes ', estimatedAvgBytes);

      // Simple approach: for small number of blocks, just return all of them
      if (gziIndex.length < 10) {
        console.log('Small number of blocks, returning all');
        return Array.from({ length: gziIndex.length }, (_, i) => i);
      }

      // If more precise mapping is needed:
      const recordsPerBlock = Math.floor(
        totalUncompressedSize / (avgBytesPerRecord * gziIndex.length)
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
        gziIndex.length - 1,
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
    [gziIndex, avgBytesPerRecord]
  );

  // Get estimated block index for a specific page
  // const getBlockIndicesForPage = useCallback(
  //   (page: number, itemsPerPage: number): number[] => {
  //     if (!gziIndex || gziIndex.length === 0) return [];
  //
  //     // Estimate which blocks contain the page data
  //     // This is an approximation - for real usage, you'd need a more accurate mapping
  //     const totalUncompressedSize =
  //       gziIndex[gziIndex.length - 1].uncompressedOffset;
  //     const avgBytesPerRecord = 100; // Rough estimate - tune based on your data
  //     const estimatedTotalRecords = Math.floor(
  //       totalUncompressedSize / avgBytesPerRecord
  //     );
  //
  //     const startRecord = (page - 1) * itemsPerPage;
  //     const endRecord = Math.min(
  //       startRecord + itemsPerPage,
  //       estimatedTotalRecords
  //     );
  //
  //     const startByte = Math.floor(startRecord * avgBytesPerRecord);
  //     const endByte = Math.ceil(endRecord * avgBytesPerRecord);
  //
  //     // Find blocks that cover this byte range
  //     const blocks: number[] = [];
  //     for (let i = 0; i < gziIndex.length; i++) {
  //       const blockStart = gziIndex[i].uncompressedOffset;
  //       const blockEnd =
  //         i < gziIndex.length - 1
  //           ? gziIndex[i + 1].uncompressedOffset
  //           : totalUncompressedSize;
  //
  //       if (blockEnd >= startByte && blockStart <= endByte) {
  //         blocks.push(i);
  //       }
  //
  //       if (blockStart > endByte) break;
  //     }
  //
  //     return blocks;
  //   },
  //   [gziIndex]
  // );

  // Load data for a specific page
  const loadPage = useCallback(
    async (page: number) => {
      setIsLoading(true);

      try {
        if (!gziIndex || gziIndex.length === 0) {
          // Load index if not already loaded
          const index = await fetchGziIndex();
          if (!index) {
            throw new Error('Failed to load index file');
          }
        }

        const blockIndices = getBlockIndicesForPage(page, pageSize);

        if (blockIndices.length === 0) {
          throw new Error('Could not determine which blocks to fetch');
        }

        // Fetch all needed blocks
        const blockDataPromises = blockIndices.map((idx) =>
          fetchBgzipBlock(idx)
        );
        console.log('blockIndices ', blockIndices);
        console.log(
          `Fetching ${blockIndices.length} blocks: ${blockIndices.join(', ')}`
        );
        const blockDataResults = await Promise.all(blockDataPromises);

        console.log(`Received ${blockDataResults.length} block results`);
        console.log(
          `Block data valid: ${blockDataResults
            .map((block) => (block ? 'yes' : 'no'))
            .join(', ')}`
        );
        console.log('blockDataResults ', blockDataResults);

        // Combine and parse block data
        let allText = '';
        for (const blockData of blockDataResults) {
          if (blockData) {
            allText += blockData;
          }
        }

        console.log('allText ', allText);

        // Parse the TSV data
        const lines = allText.split('\n').filter((line) => line.trim() !== '');
        console.log('LINES LENGTH ', lines.length);

        if (lines.length === 0) {
          setKoPathwayData([]);
          setIsLoading(false);
          return;
        }

        // Check if we have the header line
        let headerLine = lines[0];
        let dataLines = lines;

        // If the first line doesn't look like a header, we'll prepend a header
        if (
          !headerLine.toLowerCase().includes('module_accession') &&
          !headerLine.includes('completeness') &&
          !headerLine.includes('pathway_name')
        ) {
          // Use a default header if needed
          headerLine =
            'module_accession\tcompleteness\tpathway_name\tpathway_class\tmatching_ko\tmissing_ko';
        } else {
          // Skip the header line for data processing
          dataLines = lines.slice(1);
        }

        const headers = headerLine.split('\t');

        // Get column indices for each field
        const colIndices = {
          classId: headers.findIndex((h) => h.includes('module_accession')),
          completeness: headers.findIndex((h) => h.includes('completeness')),
          name: headers.findIndex((h) => h.includes('pathway_name')),
          description: headers.findIndex((h) => h.includes('pathway_class')),
          matchingKO: headers.findIndex((h) => h.includes('matching_ko')),
          missingKOs: headers.findIndex((h) => h.includes('missing_ko')),
        };

        // Use default indices if not found
        if (colIndices.classId === -1) colIndices.classId = 0;
        if (colIndices.completeness === -1) colIndices.completeness = 1;
        if (colIndices.name === -1) colIndices.name = 2;
        if (colIndices.description === -1) colIndices.description = 3;
        if (colIndices.matchingKO === -1) colIndices.matchingKO = 4;
        if (colIndices.missingKOs === -1) colIndices.missingKOs = 5;

        // Parse data lines
        const parsedData = dataLines
          .map((line) => {
            const values = line.split('\t');
            if (values.length < 4) return null; // Skip malformed lines

            return {
              classId: values[colIndices.classId] || '',
              completeness: parseFloat(values[colIndices.completeness] || '0'),
              name: values[colIndices.name] || 'Unknown',
              description: values[colIndices.description] || '',
              matchingKO: values[colIndices.matchingKO] || '',
              missingKOs: values[colIndices.missingKOs] || '',
            };
          })
          .filter(Boolean) as KOPathway[];

        // Sort by completeness (descending) and then by name
        const sortedData = parsedData.sort((a, b) => {
          if (b.completeness !== a.completeness) {
            return b.completeness - a.completeness;
          }
          return a.name.localeCompare(b.name);
        });

        // Take only the items for current page
        const startIdx =
          (page - 1) * pageSize - blockIndices[0] * (1000 / avgBytesPerRecord); // Rough approximation
        const pageData = sortedData.slice(
          Math.max(0, startIdx),
          Math.max(0, startIdx) + pageSize
        );

        setKoPathwayData(pageData);
        setCurrentPage(page);
      } catch (err) {
        console.error('Error loading page:', err);
        setError(
          `Failed to load data: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchGziIndex, getBlockIndicesForPage, fetchBgzipBlock, gziIndex, pageSize]
  );

  // Initial load
  useEffect(() => {
    // examineFileStructure();
    loadPage(1);
  }, [loadPage]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadPage(newPage);
  };

  // Group data by metabolism type for summary
  interface GroupedPathways {
    [key: string]: KOPathway[];
  }

  const groupedData = koPathwayData.reduce<GroupedPathways>((acc, pathway) => {
    const metabolismType =
      pathway.description.split(';')[1]?.trim() || 'Other metabolism';
    if (!acc[metabolismType]) {
      acc[metabolismType] = [];
    }
    acc[metabolismType].push(pathway);
    return acc;
  }, {});

  // Calculate summary statistics
  const totalPathways = koPathwayData.length;
  const totalMatchingKOs = koPathwayData.reduce(
    (sum, pathway) =>
      sum +
      (pathway.matchingKO
        ? pathway.matchingKO.split(',').filter((k) => k).length
        : 0),
    0
  );
  const completePathways = koPathwayData.filter(
    (pathway) => pathway.completeness === 100
  ).length;

  // Get the color for metabolism type
  const getMetabolismColor = (metabolismType: string): string => {
    const colorMap: { [key: string]: string } = {
      'Carbohydrate metabolism': 'bg-blue-100 border-blue-300',
      'Amino acid metabolism': 'bg-green-100 border-green-300',
      'Nucleotide metabolism': 'bg-purple-100 border-purple-300',
      'Lipid metabolism': 'bg-orange-100 border-orange-300',
      'Energy metabolism': 'bg-red-100 border-red-300',
      'Metabolism of cofactors and vitamins': 'bg-yellow-100 border-yellow-300',
      'Glycan metabolism': 'bg-pink-100 border-pink-300',
      'Biosynthesis of terpenoids and polyketides':
        'bg-indigo-100 border-indigo-300',
      'Biosynthesis of other secondary metabolites':
        'bg-teal-100 border-teal-300',
      'Xenobiotics biodegradation': 'bg-amber-100 border-amber-300',
    };
    return colorMap[metabolismType] || 'bg-gray-100 border-gray-300';
  };

  // Render loading state
  if (isLoading && koPathwayData.length === 0) {
    return (
      <div className="vf-stack vf-stack--400 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading KEGG pathway data...</p>
          <p className="text-sm text-gray-500 mt-1">
            Accessing data using BGZip index
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="vf-stack vf-stack--400">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
          <h1 className="vf-text vf-text--heading-l text-center mb-6 text-red-600">
            Error Loading Data
          </h1>
          <p className="text-center">{error}</p>
          <div className="mt-4 text-center">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={() => {
                setError(null);
                loadPage(1);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vf-stack vf-stack--400">
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h1 className="vf-text vf-text--heading-l text-center mb-6">
          KEGG Orthology Pathway Analysis
        </h1>

        {/* File stats */}
        <div className="mb-4 text-sm text-gray-600 text-center">
          <p>
            Using BGZip indexed access ({fileStats.totalBlocks} blocks,{' '}
            {(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB)
            {fileStats.totalRecords &&
              ` - Approximately ${fileStats.totalRecords} records`}
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-center mb-6">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">First</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium">
              Page {currentPage} of {totalPages}
              {isLoading && (
                <span className="ml-2 inline-block w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
              )}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Last</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {/* Summary Cards */}
          <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <div className="flex items-center">
                <span className="text-blue-500 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {totalPathways}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">
                    Pathways (Current Page)
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <div className="flex items-center">
                <span className="text-green-500 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {totalMatchingKOs}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">Matching KOs</p>
                </div>
              </div>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <div className="flex items-center">
                <span className="text-purple-500 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {completePathways}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">Complete Pathways</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Pathway Categories */}
        <details className="vf-details mb-6">
          <summary className="vf-details--summary bg-gray-100 hover:bg-gray-200 transition-colors">
            <span className="font-medium">Pathway Categories Overview</span>
          </summary>
          <div className="p-4 bg-white rounded-b-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {Object.entries(groupedData).map(([metabolismType, pathways]) => {
                const colorClass = getMetabolismColor(metabolismType);
                return (
                  <article
                    className={`vf-card vf-card--bordered rounded-lg shadow-sm border-l-4 ${colorClass}`}
                    key={metabolismType}
                  >
                    <div className="vf-card__content | vf-stack vf-stack--200 p-4">
                      <h3 className="vf-card__heading text-lg">
                        {metabolismType}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (pathways.length / totalPathways) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-3 whitespace-nowrap text-sm">
                          <strong>{pathways.length}</strong> pathways
                        </span>
                      </div>
                      <ul className="vf-list text-sm">
                        {pathways.slice(0, 3).map((pathway) => (
                          <li
                            key={pathway.classId}
                            className="vf-list__item py-1 border-b border-gray-100 last:border-b-0"
                          >
                            <a
                              href={`#${pathway.classId}`}
                              className="vf-link flex items-center"
                            >
                              <span className="font-medium">
                                {pathway.classId}
                              </span>
                              <span className="mx-1">:</span>
                              <span className="truncate">{pathway.name}</span>
                            </a>
                          </li>
                        ))}
                        {pathways.length > 3 && (
                          <li className="vf-list__item py-1 text-right">
                            <span className="text-gray-500 text-xs">
                              + {pathways.length - 3} more
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </details>

        {/* Pathway Modules Table */}
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <div className="border-b pb-3 mb-4">
              <h2 className="vf-card__heading">KEGG Pathway Modules</h2>
              <p className="vf-card__subheading text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="vf-table w-full">
                <thead className="vf-table__header bg-gray-50">
                  <tr className="vf-table__row">
                    <th className="vf-table__heading">Class ID</th>
                    <th className="vf-table__heading">Name</th>
                    <th className="vf-table__heading">Description</th>
                    <th className="vf-table__heading text-center">
                      Completeness
                    </th>
                    <th className="vf-table__heading text-center">
                      Matching KOs
                    </th>
                    <th className="vf-table__heading text-center">
                      Missing KOs
                    </th>
                  </tr>
                </thead>
                <tbody className="vf-table__body">
                  {koPathwayData.map((pathway) => {
                    const metabolismType =
                      pathway.description.split(';')[1]?.trim() ||
                      'Other metabolism';
                    const rowColorClass = metabolismType.includes(
                      'Carbohydrate'
                    )
                      ? 'hover:bg-blue-50'
                      : metabolismType.includes('Amino acid')
                      ? 'hover:bg-green-50'
                      : metabolismType.includes('Nucleotide')
                      ? 'hover:bg-purple-50'
                      : metabolismType.includes('Lipid')
                      ? 'hover:bg-orange-50'
                      : metabolismType.includes('Energy')
                      ? 'hover:bg-red-50'
                      : metabolismType.includes('Metabolism of cofactors')
                      ? 'hover:bg-yellow-50'
                      : 'hover:bg-gray-50';

                    const matchingKOCount = pathway.matchingKO
                      ? pathway.matchingKO.split(',').filter((k) => k).length
                      : 0;
                    const missingKOCount = pathway.missingKOs
                      ? pathway.missingKOs.split(',').filter((k) => k).length
                      : 0;

                    return (
                      <tr
                        className={`vf-table__row ${rowColorClass}`}
                        key={pathway.classId}
                        id={pathway.classId}
                      >
                        <td className="vf-table__cell font-medium text-blue-600">
                          <a
                            href={`https://www.genome.jp/kegg-bin/show_module?${pathway.classId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vf-link"
                          >
                            {pathway.classId}
                          </a>
                        </td>
                        <td className="vf-table__cell">{pathway.name}</td>
                        <td className="vf-table__cell text-sm">
                          {pathway.description}
                        </td>
                        <td className="vf-table__cell text-center">
                          <div className="inline-flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${
                                  pathway.completeness === 100
                                    ? 'bg-green-600'
                                    : pathway.completeness >= 75
                                    ? 'bg-green-500'
                                    : pathway.completeness >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                } h-2 rounded-full`}
                                style={{ width: `${pathway.completeness}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">
                              {pathway.completeness.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="vf-table__cell text-center font-medium">
                          <div className="group relative">
                            {matchingKOCount}
                            {matchingKOCount > 0 &&
                              pathway.matchingKO.length > 15 && (
                                <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-56 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-normal break-all">
                                  {pathway.matchingKO}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="vf-table__cell text-center text-gray-500">
                          <div className="group relative">
                            {missingKOCount}
                            {missingKOCount > 0 &&
                              pathway.missingKOs.length > 15 && (
                                <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-56 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-normal break-all">
                                  {pathway.missingKOs}
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {koPathwayData.length === 0 && (
                    <tr className="vf-table__row">
                      <td
                        colSpan={6}
                        className="vf-table__cell text-center py-8 text-gray-500"
                      >
                        No pathway data found for this page
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DetailedVisualisationCard>

        {/* Bottom pagination */}
        <div className="flex justify-center mt-6">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">First</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium">
              Page {currentPage} of {totalPages}
              {isLoading && (
                <span className="ml-2 inline-block w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
              )}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Last</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default KOTab;
