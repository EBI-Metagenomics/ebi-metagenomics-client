import config from 'utils/config';

const accession = 'MGYA00589025';
const assembly = 'ERZ842083';
const contigId = 'ERZ842083.1-NODE-1-length-1000-cov-22';
const contig = {
  id: contigId,
  type: 'analysis-job-contigs',
  attributes: {
    'contig-id': contigId,
    accession,
    length: 1000,
    coverage: 22,
    'has-kegg': true,
  },
};

function stubPage(assemblyValue = { accession: assembly }) {
  cy.intercept('GET', `**/analyses/${accession}`, {
    accession,
    study_accession: 'MGYS00002008',
    experiment_type: 'Assembly',
    pipeline_version: 'V5',
    assembly: assemblyValue,
    downloads: [],
  });
  cy.intercept('GET', `${config.api}analyses/${accession}/contigs?*`, {
    data: [contig],
    links: { next: null, prev: null },
    meta: { pagination: { count: 1 } },
  }).as('contigs');
  cy.intercept('GET', `${config.api}analyses/${accession}/contigs/${contigId}`, {
    headers: { 'content-type': 'text/plain' },
    body: `>${contigId}\n${'ACGT'.repeat(250)}\n`,
  });
  cy.intercept('GET', `${config.api}analyses/${accession}/contigs/${contigId}/annotations*`, {
    headers: { 'content-type': 'text/plain' },
    body: `##gff-version 3\n${contigId}\tProdigal\tCDS\t1\t90\t.\t+\t0\tID=gene1;Name=gene1\n`,
  });
}

function checkViewer() {
  cy.get('.mg-contigs-table .contig-id-button')
    .should('be.visible')
    .and('contain', assembly);
  cy.get('#contig .igv-container canvas').should('exist');
  cy.contains('Add offline RO-Crate').should('be.visible');
  cy.contains('General Error').should('not.exist');
  cy.get('.mg-contigs-table button.contig-id-button').click();
  cy.location('search').should('contain', 'selectedContig=');
  cy.get('@consoleError').should((spy) => {
    const messages = spy.args.map((args) => args.join(' ')).join('\n');
    expect(messages).not.to.match(
      /Symbols are not valid as a React child|Cannot read properties/
    );
  });
}

describe('Legacy V5 analysis contig viewer', () => {
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      cy.spy(win.console, 'error').as('consoleError');
    });
  });

  it('uses the v2 assembly accession even when optional annotations return 404', () => {
    stubPage();
    cy.intercept('GET', `${config.api}assemblies/*/extra-annotations`, req => {
      expect(req.url).to.contain(`/assemblies/${assembly}/extra-annotations`);
      req.reply({ statusCode: 404, body: { detail: 'Not found' } });
    }).as('crates');
    cy.visit(`/metagenomics/analyses/${accession}/contigs-viewer`);
    cy.wait('@crates');
    checkViewer();
  });

  it('does not request annotations for an absent assembly', () => {
    stubPage(null);
    const annotationRequest = cy.stub().as('annotationRequest');
    cy.intercept('GET', `${config.api}assemblies/*/extra-annotations`, req => {
      annotationRequest(req.url);
      req.reply({ data: [] });
    });
    cy.visit(`/metagenomics/analyses/${accession}/contigs-viewer`);
    checkViewer();
    cy.get('@annotationRequest').should('not.have.been.called');
  });

  it('shows a request error without a page crash when v1 contigs are unavailable', () => {
    stubPage();
    cy.intercept('GET', `${config.api}assemblies/*/extra-annotations`, { data: [] });
    cy.intercept('GET', `${config.api}analyses/${accession}/contigs?*`, { forceNetworkError: true });
    cy.visit(`/metagenomics/analyses/${accession}/contigs-viewer`);
    cy.contains('Error Fetching Data').should('be.visible');
    cy.contains('General Error').should('not.exist');
  });
});
