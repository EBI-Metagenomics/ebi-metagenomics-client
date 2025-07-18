// This file contains utility functions to generate mock binary data for testing the BGZipService

/**
 * Creates a mock GZI index file with the specified entries
 * @param {Array<{compressedOffset: number, uncompressedOffset: number}>} entries - The GZI entries
 * @returns {ArrayBuffer} - The binary data for the GZI index file
 */
export function createMockGziIndex(entries = []) {
  // GZI format: 8-byte header (number of entries) followed by entries (16 bytes each)
  const buffer = new ArrayBuffer(8 + entries.length * 16);
  const view = new DataView(buffer);
  
  // Write the number of entries (8 bytes, little endian)
  view.setBigUint64(0, BigInt(entries.length), true);
  
  // Write each entry (16 bytes each: 8 bytes compressed offset + 8 bytes uncompressed offset)
  entries.forEach((entry, index) => {
    const baseOffset = 8 + index * 16;
    view.setBigUint64(baseOffset, BigInt(entry.compressedOffset), true);
    view.setBigUint64(baseOffset + 8, BigInt(entry.uncompressedOffset), true);
  });
  
  return buffer;
}

/**
 * Creates a simple mock BGZF block with the specified content
 * This is a simplified version that doesn't create a fully valid BGZF block,
 * but contains enough structure for the BGZipService to parse
 * @param {string} content - The content to compress
 * @returns {Uint8Array} - The binary data for the BGZF block
 */
export function createMockBgzfBlock(content) {
  // In a real implementation, we would compress the content using the BGZF format
  // For testing purposes, we'll create a simplified structure that the BGZipService can parse
  
  // Import pako for compression
  const pako = require('pako');
  
  // Convert content to Uint8Array
  const textEncoder = new TextEncoder();
  const contentBytes = textEncoder.encode(content);
  
  // Compress the content using deflate
  const compressedData = pako.deflateRaw(contentBytes);
  
  // Create a simple BGZF block structure that matches what BGZipService expects
  // The service reads the block size from bytes 16-17 and expects the deflate data to start at byte 18
  
  // Create a fixed-size header that ends with the block size at bytes 16-17
  const header = new Uint8Array(18);
  
  // Standard gzip header
  header[0] = 0x1f; // ID1
  header[1] = 0x8b; // ID2
  header[2] = 0x08; // CM (deflate)
  header[3] = 0x04; // FLG (FEXTRA set)
  header[4] = 0x00; // MTIME
  header[5] = 0x00; // MTIME
  header[6] = 0x00; // MTIME
  header[7] = 0x00; // MTIME
  header[8] = 0x00; // XFL
  header[9] = 0xff; // OS
  
  // Extra field (8 bytes to reach position 16 where BSIZE is expected)
  header[10] = 0x06; // XLEN LSB (6 bytes of extra data)
  header[11] = 0x00; // XLEN MSB
  header[12] = 0x42; // SI1 ('B')
  header[13] = 0x43; // SI2 ('C')
  header[14] = 0x02; // LEN LSB (2 bytes of subfield data)
  header[15] = 0x00; // LEN MSB
  
  // Calculate the total block size
  const blockSize = header.length + compressedData.length + 8; // header + data + 8 footer
  console.log('blockSize calculated: ', blockSize);


  // BSIZE-1 field (the BGZipService reads this from bytes 16-17)
  const bsizeMinusOne = blockSize - 1;
  header[16] = bsizeMinusOne & 0xff;
  header[17] = (bsizeMinusOne >> 8) & 0xff;
  
  // Create a footer (CRC32 and ISIZE, simplified for testing)
  const footer = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
  
  // Combine header, compressed data, and footer
  const result = new Uint8Array(blockSize);
  result.set(header);
  result.set(compressedData, header.length);
  result.set(footer, header.length + compressedData.length);
  
  return result;
}

/**
 * Creates a mock response for a range request to a BGZF file
 * @param {string} content - The content to include in the response
 * @returns {Uint8Array} - The binary data for the response
 */
export function createMockRangeResponse(content) {
  return createMockBgzfBlock(content);
}

/**
 * Creates a simple TSV content with test data
 * @param {number} numRows - Number of rows to generate
 * @param {number} numCols - Number of columns to generate
 * @returns {string} - The TSV content
 */
export function createTestTsvContent(numRows = 10, numCols = 3) {
  const rows = [];
  
  // Create header row
  const header = Array.from({ length: numCols }, (_, i) => `Column${i + 1}`);
  rows.push(header.join('\t'));
  
  // Create data rows
  for (let i = 0; i < numRows; i++) {
    const row = Array.from({ length: numCols }, (_, j) => `Value${i + 1}-${j + 1}`);
    rows.push(row.join('\t'));
  }
  
  return rows.join('\n');
}