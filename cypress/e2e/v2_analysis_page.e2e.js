import {openPage} from '../util/util';

function stubAnalysisDetails(accession, experimentType, overrides = {}) {
  cy.intercept('GET', `**/analyses/${accession}*`, {
    statusCode: 200,
    body: {
      accession: accession,
      study_accession: 'MGYS0000001',
      experiment_type: experimentType,
      pipeline_version: 'v6.0',
      run: { accession: 'ERR000001' },
      sample: { accession: 'ERS000001' },
      read_run: {
        instrument_model: 'Illumina HiSeq 2000',
        instrument_platform: 'ILLUMINA',
      },
      assembly: null,
      downloads: [],
      quality_control_summary: {},
      metadata: {},
      results_dir: 'https://www.ebi.ac.uk/metagenomics/results/1',
      ...overrides,
    },
  }).as('analysis-details');
}

describe('V2 Analysis page', () => {
  it('renders correctly for Amplicon experiment type', () => {
    const acc = 'MGYA01000004';
    stubAnalysisDetails(acc, 'amplicon');

    openPage(`v2-analyses/${acc}`);

    cy.wait('@analysis-details');

    // Breadcrumbs
    cy.get('.vf-breadcrumbs').should('exist');
    cy.contains('.vf-breadcrumbs__item', 'Home');
    cy.contains('.vf-breadcrumbs__item', 'Studies');
    cy.contains('.vf-breadcrumbs__item', 'MGYS0000001');
    cy.contains('.vf-breadcrumbs__item', acc);

    // Heading
    cy.contains('h2', `Analysis ${acc}`);

    // Tabs for Amplicon
    cy.get('.vf-tabs').within(() => {
      cy.contains('Overview');
      cy.contains('Quality control');
      cy.contains('Taxonomy');
      cy.contains('ASV');
      cy.contains('Downloads');
      cy.contains('Functional analysis').should('not.exist');
      cy.contains('Pathways/Systems').should('not.exist');
      cy.contains('Contig Viewer').should('not.exist');
    });

    // Default redirect to overview
    cy.url().should('include', '/overview');
  });

  it('renders correctly for Metagenomic experiment type', () => {
    const acc = 'MGYA00000005';
    stubAnalysisDetails(acc, 'metagenomic');

    openPage(`v2-analyses/${acc}`);

    cy.wait('@analysis-details');

    // Breadcrumbs
    cy.get('.vf-breadcrumbs').should('exist');
    cy.contains('.vf-breadcrumbs__item', 'Home');
    cy.contains('.vf-breadcrumbs__item', 'Studies');
    cy.contains('.vf-breadcrumbs__item', 'MGYS0000001');
    cy.contains('.vf-breadcrumbs__item', acc);

    // Heading
    cy.contains('h2', `Analysis ${acc}`);

    // Tabs for Metagenomic
    cy.get('.vf-tabs').within(() => {
      cy.contains('Overview');
      cy.contains('Quality control');
      cy.contains('Taxonomy');
      cy.contains('Downloads');
      cy.contains('Functional analysis').should('not.exist');
      cy.contains('Pathways/Systems').should('not.exist');
      cy.contains('Contig Viewer').should('not.exist');
      cy.contains('ASV').should('not.exist');
    });

    cy.url().should('include', '/overview');
  });

  it('renders correctly for Assembly experiment type', () => {
    const acc = 'MGYA00000002';
    stubAnalysisDetails(acc, 'assembly');

    openPage(`v2-analyses/${acc}`);

    cy.wait('@analysis-details');

    // Tabs for Assembly
    cy.get('.vf-tabs').within(() => {
      cy.contains('Overview');
      cy.contains('Quality control');
      cy.contains('Taxonomy');
      cy.contains('Functional analysis');
      cy.contains('Pathways/Systems');
      cy.contains('Contig Viewer');
      cy.contains('ASV').should('not.exist');
    });
  });

  it('navigates between tabs correctly', () => {
    const acc = 'MGYA00000003';
    stubAnalysisDetails(acc, 'amplicon');

    openPage(`v2-analyses/${acc}`);
    cy.wait('@analysis-details');

    cy.get('.vf-tabs').contains('Quality control').click();
    cy.url().should('include', '/qc');

    cy.get('.vf-tabs').contains('Taxonomy').click();
    cy.url().should('include', '/taxonomic');

    cy.get('.vf-tabs').contains('ASV').click();
    cy.url().should('include', '/asv');
  });

  it('shows error message on API failure', () => {
    const acc = 'MGYA00000004';
    cy.intercept('GET', `**/analyses/${acc}*`, {
      statusCode: 404,
      body: {
        errors: [{ detail: 'Not found' }],
      },
    }).as('analysis-error');

    openPage(`v2-analyses/${acc}`);
    cy.wait('@analysis-error');

    cy.contains('Error Fetching Data').should('be.visible');
    cy.contains('404').should('be.visible');
  });
});
