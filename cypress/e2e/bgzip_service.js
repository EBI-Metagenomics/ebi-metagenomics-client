/// <reference types="cypress" />

import { BGZipService } from 'components/Analysis/BgZipService';
import { 
  createMockGziIndex, 
  createMockBgzfBlock, 
  createMockRangeResponse, 
  createTestTsvContent 
} from '../fixtures/bgzip/mockBinaryData';

describe('BGZipService', () => {
  let downloadFixture;

  beforeEach(() => {
    // Load the download fixture
    cy.fixture('bgzip/download.json').then((download) => {
      downloadFixture = download;
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid index file', () => {
      // Create a mock GZI index with 3 entries
      const mockEntries = [
        { compressedOffset: 0, uncompressedOffset: 0 },
        { compressedOffset: 1000, uncompressedOffset: 2000 },
        { compressedOffset: 2000, uncompressedOffset: 4000 }
      ];
      const mockGziIndex = createMockGziIndex(mockEntries);

      // Intercept the index file request
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 200,
          body: mockGziIndex,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      ).as('getIndexFile');

      // Create a new BGZipService instance
      cy.window().then((win) => {
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to complete
        return service.initialize().then((result) => {
          // Verify initialization was successful
          expect(result).to.be.true;
          expect(service.isInitialized).to.be.true;
          
          // Verify the page count matches the number of entries
          expect(service.getPageCount()).to.equal(mockEntries.length);
        });
      });

      // Verify the index file was requested
      cy.wait('@getIndexFile');
    });

    it('should handle initialization failure with invalid index file', () => {
      // Intercept the index file request with an error response
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 404,
          body: 'Not Found'
        }
      ).as('getIndexFile');

      // Create a new BGZipService instance
      cy.window().then((win) => {
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to complete
        return service.initialize().then((result) => {
          // Verify initialization failed
          expect(result).to.be.false;
          expect(service.isInitialized).to.be.false;
        });
      });

      // Verify the index file was requested
      cy.wait('@getIndexFile');
    });
  });

  describe('Page Reading', () => {
    it('should read and parse a page as TSV', () => {
      // Create test data
      const testTsvContent = createTestTsvContent(5, 3);
      
      // Create a mock GZI index with 1 entry
      const mockEntries = [
        { compressedOffset: 0, uncompressedOffset: 0 }
      ];
      const mockGziIndex = createMockGziIndex(mockEntries);

      // Intercept the index file request
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 200,
          body: mockGziIndex,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      ).as('getIndexFile');

      // Intercept the range request for the data file
      cy.intercept(
        {
          method: 'GET',
          url: 'https://example.com/test-data.tsv.gz',
          headers: {
            'Range': 'bytes=0-65535'
          }
        },
        {
          statusCode: 206,
          body: createMockBgzfBlock(testTsvContent),
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Range': 'bytes 0-1000/1000'
          }
        }
      ).as('getRangeData');

      // Create a new BGZipService instance and test reading a page
      cy.window().then((win) => {
        console.log('HERE IS THE FIXTURE:');
        console.log('FIXTURED ', downloadFixture);
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to complete using cy.wrap to handle the promise
        cy.wrap(service.initialize()).then((initialized) => {
          expect(initialized).to.be.true;
          expect(service.isInitialized).to.be.true;
          
          // Read the first page as TSV using cy.wrap to handle the promise
          cy.wrap(service.readPageAsTSV(1)).then((tsvData) => {
            // Verify the TSV data
            expect(tsvData).to.be.an('array');
            expect(tsvData.length).to.equal(6); // Header + 5 data rows
            
            // Verify the header row
            expect(tsvData[0]).to.deep.equal(['Column1', 'Column2', 'Column3']);
            
            // Verify a data row
            expect(tsvData[1]).to.deep.equal(['Value1-1', 'Value1-2', 'Value1-3']);
          });
        });
      });

      // Verify the requests were made
      cy.wait('@getIndexFile');
      cy.wait('@getRangeData');
    });

    it('should handle errors when reading a page', () => {
      // Create a mock GZI index with 1 entry
      const mockEntries = [
        { compressedOffset: 0, uncompressedOffset: 0 }
      ];
      const mockGziIndex = createMockGziIndex(mockEntries);

      // Intercept the index file request
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 200,
          body: mockGziIndex,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      ).as('getIndexFile');

      // Intercept the range request with an error
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

      // Create a new BGZipService instance and test error handling
      cy.window().then((win) => {
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to complete using cy.wrap to handle the promise
        cy.wrap(service.initialize()).then((initialized) => {
          expect(initialized).to.be.true;
          expect(service.isInitialized).to.be.true;
          
          // Try to read a page, which should fail
          // Use cy.wrap to handle the promise rejection
          cy.wrap(service.readPage(0)).should('be.rejectedWith', 'Range request failed');
        });
      });

      // Verify the requests were made
      cy.wait('@getIndexFile');
      cy.wait('@getRangeData');
    });
  });

  describe('Edge Cases', () => {
    it('should handle reading a non-existent page', () => {
      // Create a mock GZI index with 1 entry
      const mockEntries = [
        { compressedOffset: 0, uncompressedOffset: 0 }
      ];
      const mockGziIndex = createMockGziIndex(mockEntries);

      // Intercept the index file request
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 200,
          body: mockGziIndex,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      ).as('getIndexFile');

      // Create a new BGZipService instance
      cy.window().then((win) => {
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to complete using cy.wrap to handle the promise
        cy.wrap(service.initialize()).then((initialized) => {
          expect(initialized).to.be.true;
          expect(service.isInitialized).to.be.true;
          
          // Try to read a non-existent page using cy.wrap to handle the promise
          cy.wrap(service.readPage(999)).then((pageData) => {
            // Verify an empty result is returned
            expect(pageData).to.be.an.instanceof(Uint8Array);
            expect(pageData.length).to.equal(0);
          });
        });
      });

      // Verify the index file was requested
      cy.wait('@getIndexFile');
    });

    it('should throw an error when trying to use methods before initialization', () => {
      // Intercept the index file request to cause initialization to fail
      cy.intercept(
        'GET',
        'https://example.com/test-data.tsv.gz.gzi',
        {
          statusCode: 404,
          body: 'Not Found'
        }
      ).as('getIndexFile');

      // Create a new BGZipService instance
      cy.window().then(() => {
        const service = new BGZipService(downloadFixture);
        
        // Wait for initialization to fail
        cy.wrap(service.initialize()).then((initialized) => {
          expect(initialized).to.be.false;
          expect(service.isInitialized).to.be.false;
          
          // Try to use methods that require initialization
          expect(() => service.getPageCount()).to.not.throw(); // This method doesn't check initialization
          
          // These methods should throw errors
          cy.wrap(service.readPage(0)).should('be.rejectedWith', 'Service not initialized yet');
          cy.wrap(service.readPageAsTSV(1)).should('be.rejectedWith', 'Service not initialized yet');
        });
      });
      
      // Verify the index file was requested
      cy.wait('@getIndexFile');
    });
  });
});