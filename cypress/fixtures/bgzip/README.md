# BGZipService Cypress Tests

This directory contains fixtures and utilities for testing the BGZipService component.

## Overview

The BGZipService is responsible for reading and parsing compressed TSV files in the BGZF (Blocked GZip Format) format. These tests verify that the service correctly:

1. Initializes by loading and parsing the GZI index file
2. Reads and decompresses BGZF blocks
3. Parses the decompressed data as TSV
4. Handles various error conditions and edge cases

## Test Fixtures

### `download.json`

A mock Download object that conforms to the Download interface expected by the BGZipService constructor.

### `mockBinaryData.js`

Utility functions for generating mock binary data for testing:

- `createMockGziIndex(entries)`: Creates a mock GZI index file with the specified entries
- `createMockBgzfBlock(content)`: Creates a simplified BGZF block with compressed content
- `createMockRangeResponse(content)`: Creates a mock response for range requests
- `createTestTsvContent(numRows, numCols)`: Generates test TSV content

## Test Cases

The tests are organized into three main sections:

### Initialization Tests

- Verify successful initialization with a valid index file
- Verify handling of initialization failure with an invalid index file

### Page Reading Tests

- Verify reading and parsing a page as TSV
- Verify handling of errors when reading a page

### Edge Case Tests

- Verify handling of reading a non-existent page
- Verify error handling when trying to use methods before initialization

## Running the Tests

To run the tests:

```bash
# Run all tests
npx cypress run

# Run just the BGZipService tests
npx cypress run --spec "cypress/e2e/bgzip_service.js"

# Open Cypress Test Runner to run tests interactively
npx cypress open
```

## Implementation Notes

The tests use Cypress's `cy.intercept()` to mock the network requests that the BGZipService makes. This allows us to test the service without making actual network requests.

The mock binary data is generated at runtime using the utility functions in `mockBinaryData.js`. This approach allows us to create valid binary data that the BGZipService can parse correctly.

### Block Size Calculation

The BGZF format includes a block size field in the header (bytes 16-17) that specifies the total size of the block. The BGZipService validates this size against the actual length of the buffer to ensure the block is valid:

```javascript
const blockSize = block[16] + (block[17] << 8) + 1;
if (blockSize > block.length) {
  throw new Error(
    `Block size ${blockSize} larger than buffer length ${block.length}`
  );
}
```

In the `createMockBgzfBlock` function, we calculate this size based on the actual data:

```javascript
const blockSize = header.length + compressedData.length + 8; // header + data + 8 footer
```

This ensures that the block size in the header matches the actual size of the block, preventing the error from being thrown.

## Potential Issues

- The mock BGZF blocks are simplified and may not fully represent real-world BGZF files
- The tests assume that the pako library (used for decompression) is available in the Cypress test environment
- Range requests may be handled differently in different browsers, which could affect the tests