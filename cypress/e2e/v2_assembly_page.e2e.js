// / <reference types="cypress" />

// E2E tests for V2 Assembly page component (src/pages/Assembly/v2index.tsx)
// Requirement: use .js (not .cy.ts)

const API_V2 = Cypress.env('API_V2') || 'https://www.ebi.ac.uk/metagenomics/api/v2';

function stubAssemblyDetails(accession, overrides = {}) {
  cy.intercept('GET', `${API_V2}/assemblies/${accession}`, {
    statusCode: 200,
    body: {
      data: {
        accession: accession,
        run_accession: '#',
        sample_accession: '#',
        genome_links: [],
        ...overrides
      }
    }
  }).as('assembly-details');
}

function stubAssemblyAnalyses(accession, fixture) {
  const response = fixture || {
    count: 1,
    data: [
      {
        accession: 'MGYA00000001',
        sample: { accession: 'ERS000001' },
        assembly: { accession: accession },
        run: null,
        pipeline_version: 'v5.0'
      }
    ]
  };
  cy.intercept('GET', `${API_V2}/assemblies/${accession}/analyses/?page=1`, {
    statusCode: 200,
    body: response
  }).as('assembly-analyses');
}

describe('V2 Assembly page', () => {
  it('renders Overview with ENA, Sample, Runs and empty Derived genomes', () => {
    const acc = 'GCA_TEST_V2_1';

    stubAssemblyDetails(acc);

    cy.visit(`/v2-assemblies/${acc}#overview`);

    cy.wait('@assembly-details');

    cy.contains(`Assembly: ${acc}`);
    cy.contains('Description');
    cy.contains('Sample');
    cy.contains('Runs');
    cy.contains('ENA accession');
    cy.contains('Derived genomes');
    cy.contains('No derived genomes found.');
  });

  it('renders Analyses tab and loads analyses via assemblies endpoint', () => {
    const acc = 'GCA_TEST_V2_2';

    stubAssemblyDetails(acc);
    stubAssemblyAnalyses(acc);

    cy.visit(`/v2-assemblies/${acc}#analyses`);

    cy.wait(['@assembly-details', '@assembly-analyses']);

    cy.contains('Associated analyses');
    // The table component renders a heading "Analyses"
    cy.contains('Analyses');

    // Basic column checks (labels may come from the table component)
    cy.contains('Analysis accession');
    cy.contains('Sample accession');
    cy.contains('Pipeline version');

    // Row content
    cy.contains('MGYA00000001');
    cy.contains('ERS000001');
    cy.contains('5.0');
  });
});
