# Fixing Range Request Intercepts in Cypress Tests

## Issue Description

The Cypress tests for the BGZipService were failing with the following error:

```
Range request failed: 500
src/components/Analysis/BgZipService.ts:171:13
  169 |     });
  170 |     if (!response.ok && response.status !== 206) {
> 171 |       throw new Error(`Range request failed: ${response.status}`);
      |             ^
  172 |     }
  173 |     const compressedChunk = new Uint8Array(await response.arrayBuffer());
  174 |     return this.decompressBGZFBlock(compressedChunk);
```

This error occurs when the BGZipService makes a range request to fetch data from a compressed file, but the request fails with a 500 status code. The test was intentionally setting up a scenario where a range request fails with a 500 status code to test the error handling in the BGZipService, but the intercept wasn't working correctly.

## Root Cause

The issue was with how the range request was being intercepted in the Cypress test. The test was using a wildcard in the Range header:

```javascript
cy.intercept(
  {
    method: 'GET',
    url: 'https://example.com/test-data.tsv.gz',
    headers: {
      'Range': 'bytes=0-*'
    }
  },
  {
    statusCode: 500,
    body: 'Server Error'
  }
).as('getRangeData');
```

However, the BGZipService was making a request with a specific range:

```typescript
const response = await fetch(this.dataFileUrl, {
  headers: {
    Range: `bytes=${start}-${end}`,
  },
});
```

Where `start` is 0 and `end` is 65535 (since the maxBlockSize is 65536 bytes, and the range is 0-based).

Cypress wasn't correctly matching the range request because of the wildcard in the Range header, causing the test to fail.

## Solution

The solution was to update the range request intercepts in the test to use the exact range format that the service is using:

```javascript
cy.intercept(
  {
    method: 'GET',
    url: 'https://example.com/test-data.tsv.gz',
    headers: {
      'Range': 'bytes=0-65535'
    }
  },
  {
    statusCode: 500,
    body: 'Server Error'
  }
).as('getRangeData');
```

This ensures that the intercept correctly matches the range request made by the service.

## Best Practices for Intercepting Range Requests in Cypress Tests

When intercepting range requests in Cypress tests:

1. Use the exact range format that the service is using, rather than wildcards
2. Make sure the Content-Type and Content-Range headers are set correctly for successful responses
3. For error responses, make sure the status code matches what the service is expecting
4. Remember that range requests are case-sensitive, so 'Range' and 'range' are different headers

Following these practices ensures that Cypress correctly matches and intercepts range requests, avoiding issues like the one described above.