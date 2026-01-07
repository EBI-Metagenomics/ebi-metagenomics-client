# Explanation of `parseGziIndex()` Method and GZI Index Handling

## What are Gzip Blocks and GZI Files?

Gzip is a file compression format that compresses data into blocks. BGZip (Blocked GZip) is a specialized variant used in bioinformatics that divides data into fixed-size blocks, each independently compressed. This allows for random access to compressed data.

Each gzip block:
- Has a header with magic numbers (0x1f, 0x8b) that identify the start of a block
- Contains compressed data
- Has a footer with checksums and size information


A **GZI index** file stores the mapping between compressed offsets and uncompressed offsets for each block in a BGZF file. This mapping is essential for jumping to a specific position in the file without decompressing everything from the start.

## The `parseGziIndex()` Method

The `parseGziIndex()` method in `BgZipService.ts` handles the loading and validation of the GZI index:

```typescript
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

  /*
   Handle edge cases: if first uncompressed offset > 0, prepend artificial entry for offset 0.
   If the index is empty, make fake block of the entire file unless it seems bizarrely large.
  */
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
```

### How It Works:

1.  **Reading the Header**: The GZI file format starts with an 8-byte little-endian integer indicating the number of entries.
2.  **Iterating through Entries**: Each entry is 16 bytes: 8 bytes for the compressed offset and 8 bytes for the uncompressed offset (both little-endian).
3.  **Handling Missing/Incomplete Indices**:
    *   **Synthetic Zero Entry**: If the first entry's uncompressed offset is not 0, the service prepends a synthetic entry at `{0, 0}`. This ensures that the start of the file is always reachable.
    *   **Empty Index Fallback**: If the GZI file is empty but the compressed file is small (under `MAX_BLOCK_SIZE`), the service creates a single synthetic block for the whole file. This allows the service to work even if the index is missing for small files.

## Why GZI Parsing Matters

Correctly parsing and "healing" the index is essential for:

1.  **Random Access**: Jumping to a specific "page" (block) in the compressed file.
2.  **Robustness**: Handling cases where the index might be slightly malformed (e.g., missing the initial zero offset).
3.  **Efficiency**: Avoiding full scans of large files by relying on the pre-computed index.

## How This Enables Efficient Data Access

The `BGZipService` uses the parsed index to:

1.  **Map Pages to Offsets**: In `readPage()`, it uses the `pageNum` to look up the exact `compressedOffset` in the `gziIndex`.
2.  **Selective Fetching**: `fetchAndDecompressBlock()` uses a `Range` request to download only the specific 64KB BGZF block containing the data.
3.  **TSV Navigation**: In `readPageAsTSV()`, the service can handle files where the first page contains only comments (like headers), automatically skipping to the next data block if necessary.
4.  **Selective Decompression**: Only the requested block is inflated using `pako.inflateRaw()`, saving CPU and memory.

This architecture is particularly valuable for large genomic data files (like TSVs or GFFs) where loading the entire file into the browser would be impossible.