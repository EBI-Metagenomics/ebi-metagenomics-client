import { fetchJson, fetchText, fetchBlob, FetchError } from '../../src/utils/fetch';

describe('Fetch Utilities', () => {
  beforeEach(() => {
    // Clear any previous intercepts
    cy.window().then((win) => {
      // Restore fetch if it was mocked
      if (win.fetch.restore) win.fetch.restore();
    });
  });

  it('fetchText should return text on successful 200 OK', () => {
    const mockText = 'Hello World';
    cy.intercept('GET', '/test-text', {
      statusCode: 200,
      body: mockText,
    }).as('getText');

    cy.then(async () => {
      const text = await fetchText('/test-text');
      expect(text).to.equal(mockText);
    });
  });

  it('fetchText should throw FetchError on empty body with 200 OK', () => {
    cy.intercept('GET', '/test-empty', {
      statusCode: 200,
      body: '',
    }).as('getEmpty');

    cy.then(async () => {
      try {
        await fetchText('/test-empty', {}, 'Custom empty message');
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).to.be.instanceOf(FetchError);
        expect(e.message).to.equal('Custom empty message');
      }
    });
  });

  it('fetchText should throw FetchError on HTTP error (e.g., 404)', () => {
    cy.intercept('GET', '/test-404', {
      statusCode: 404,
    }).as('get404');

    cy.then(async () => {
      try {
        await fetchText('/test-404');
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).to.be.instanceOf(FetchError);
        expect(e.message).to.contain('HTTP error! Status: 404');
        expect(e.status).to.equal(404);
      }
    });
  });

  it('fetchJson should return parsed JSON on success', () => {
    const mockJson = { foo: 'bar' };
    cy.intercept('GET', '/test-json', {
      statusCode: 200,
      body: JSON.stringify(mockJson),
    }).as('getJson');

    cy.then(async () => {
      const json = await fetchJson('/test-json');
      expect(json).to.deep.equal(mockJson);
    });
  });

  it('fetchJson should throw FetchError on invalid JSON', () => {
    cy.intercept('GET', '/test-invalid-json', {
      statusCode: 200,
      body: 'not-json',
    }).as('getInvalidJson');

    cy.then(async () => {
      try {
        await fetchJson('/test-invalid-json', {}, 'empty', 'Custom invalid JSON message');
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).to.be.instanceOf(FetchError);
        expect(e.message).to.equal('Custom invalid JSON message');
      }
    });
  });

  it('fetchBlob should return blob and throw on empty blob', () => {
    cy.intercept('GET', '/test-blob', {
      statusCode: 200,
      body: new ArrayBuffer(8),
    }).as('getBlob');

    cy.intercept('GET', '/test-empty-blob', {
      statusCode: 200,
      body: new ArrayBuffer(0),
    }).as('getEmptyBlob');

    cy.then(async () => {
      const blob = await fetchBlob('/test-blob');
      expect(blob.size).to.equal(8);

      try {
        await fetchBlob('/test-empty-blob', {}, 'Empty blob message');
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).to.be.instanceOf(FetchError);
        expect(e.message).to.equal('Empty blob message');
      }
    });
  });
});
