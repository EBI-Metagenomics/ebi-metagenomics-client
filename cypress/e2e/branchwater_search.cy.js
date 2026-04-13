import {openPage} from '../util/util';

const MOCK_RESULTS = [
  {
    acc: 'ERR123456',
    assay_type: 'WGS',
    bioproject: 'PRJEB12345',
    cANI: 0.98,
    containment: 0.85,
    geo_loc_name_country_calc: 'United Kingdom',
    organism: 'Bacteroides thetaiotaomicron',
    lat_lon: '51.5074 N 0.1278 W'
  },
  {
    acc: 'ERR789012',
    assay_type: 'WGS',
    bioproject: 'PRJEB67890',
    cANI: 0.95,
    containment: 0.70,
    geo_loc_name_country_calc: 'USA',
    organism: 'Escherichia coli',
    lat_lon: '38.8951 N 77.0364 W'
  }
];

describe('Branchwater Search page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/services/branchwater/', {
      statusCode: 200,
      body: MOCK_RESULTS,
    }).as('gzipped-search');

    cy.intercept('POST', '**/services/branchwater/mags*', {
      statusCode: 200,
      body: MOCK_RESULTS,
    }).as('mags-search');

    openPage('branchwater-search');
  });

  it('renders correctly initial state', () => {
    cy.contains('h2', 'Search for a genome within INSDC metagenomes').should('be.visible');
    cy.contains('Instructions').should('be.visible');
    cy.get('#sourmash').should('exist');
    cy.get('#branchwater-search-button').should('be.disabled');
    cy.get('button').contains('Clear').should('be.enabled');
    cy.contains('Try an example').should('be.visible');
  });

  it('performs search using an example', () => {
    // cy.get('#bw-example-panel').click()
    cy.get('#bw-examples-button').click();

    // cy.contains('Performing search').should('be.visible');
    cy.wait('@mags-search');

    // Verify results table is visible
    cy.get('table').should('exist');
    cy.contains('ERR123456').should('be.visible');
    cy.contains('ERR789012').should('be.visible');

    // Verify plots/map are rendered (assuming Results component renders them)
    cy.contains('Results Dashboard').should('exist');
    cy.contains('Total Matches').should('exist');
    cy.contains('Unique Countries').should('exist');
  });

  it('performs search by uploading a file', () => {
    // The sourmash web component sketches files in-browser and fires 'sketchedall'
    // with the resulting signature data. Cypress cannot drive the actual in-browser
    // WebAssembly sketching (shadow-DOM file input + WASM pipeline), so we dispatch
    // the event directly on the element — exactly what the component would do after
    // processing a real file.
    cy.get('#sourmash').then(($el) => {
      $el[0].dispatchEvent(
        new CustomEvent('sketchedall', {
          detail: {
            signatures: { 'test.fasta': 'mock-signature-data' },
            errors: {},
          },
        })
      );
    });

    cy.contains('Selected file:').should('be.visible');
    cy.contains('test.fasta').should('be.visible');
    cy.get('#branchwater-search-button').should('not.be.disabled').click();
    cy.wait('@gzipped-search');

    cy.get('table').should('exist');
    cy.contains('ERR123456').should('be.visible');
  });

  it('clears results when Clear button is clicked', () => {
    cy.get('#bw-examples-button').click();
    cy.wait('@mags-search');
    cy.get('table').should('exist');

    cy.get('#clear-button-mag').click();

    cy.get('table').should('not.exist');
    cy.contains('Selected file:').should('not.exist');
  });

  it('filters results in the table', () => {
    cy.get('#bw-examples-button').click();
    cy.wait('@mags-search');

    cy.get('input#mg-text-search-query').type('ERR123456');
    cy.contains('ERR123456').should('be.visible');
    cy.contains('ERR789012').should('not.exist');
  });

  it('shows error message on API failure', () => {
    cy.intercept('POST', '**/services/branchwater/mags*', {
      statusCode: 500,
      body: 'Internal Server Error',
    }).as('mags-error');

    cy.get('#bw-examples-button').click();
    cy.wait('@mags-error');

    cy.contains('Error whilst searching').should('be.visible');
  });
});
