// eslint-disable-next-line import/extensions
import {openPage} from '../util/util';
import config from 'utils/config';

function stubAnalysisDetails(accession, experimentType, overrides = {}) {
  cy.intercept('GET', `${config.api_v2}/analyses/${accession}*`, {
    statusCode: 200,
    body: {
      accession: accession,
      study_accession: 'MGYS0000001',
      experiment_type: experimentType,
      pipeline_version: 'V6',
      run: { accession: 'ERR000001' },
      sample: { accession: 'ERS000001' },
      read_run: {
        instrument_model: 'Illumina HiSeq 2000',
        instrument_platform: 'ILLUMINA',
      },
      assembly: null,
      downloads: [
        {
          "alias": "multiqc_report.html",
          "download_type": "Quality control",
          "file_type": "html",
          "long_description": "MultiQC webpage showing quality control steps and metrics",
          "short_description": "MultiQC quality control report",
          "download_group": "quality_control",
          "file_size_bytes": null,
          "index_files": null,
          "url": "http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/ERZ857/ERZ857107/V6/assembly/qc/multiqc_report.html"
        },
      ],
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

    openPage(`analyses/${acc}/`);

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

    openPage(`analyses/${acc}/`);

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

    openPage(`analyses/${acc}`);

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

    openPage(`analyses/${acc}`);
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
    cy.intercept('GET', `${config.api_v2}/analyses/${acc}*`, {
      statusCode: 404,
      body: {
        errors: [{ detail: 'Not found' }],
      },
    }).as('analysis-error');

    openPage(`analyses/${acc}`);
    cy.wait('@analysis-error');

    cy.contains('Error Fetching Data').should('be.visible');
    cy.contains('404').should('be.visible');
  });
});
