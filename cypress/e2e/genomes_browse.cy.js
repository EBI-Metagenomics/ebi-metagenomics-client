import { openPage, waitForPageLoad } from '../util/util';
import config from 'utils/config';

describe('Browse Genomes', () => {
  beforeEach(() => {
    cy.intercept('GET', `${config.api_v2}/genomes/catalogues/**`, {
      fixture: 'apiv2/genomes/cataloguesList.json',
    }).as('catalogues');
    cy.intercept('GET', `${config.api_v2}/biomes/**`, {
      fixture: 'apiv2/biomes/biomeList.json',
    }).as('biomes');
    cy.intercept('GET', `${config.api_v2}/genomes/**`, {
      fixture: 'apiv2/genomes/genomesList.json',
    }).as('genomesList');
  });

  it('Shows catalogues list with table and download button', () => {
    openPage('browse/genomes?browseBy=biome');
    waitForPageLoad('Browse MGnify');
    // Table caption should include count number from fixture
    // cy.get('.mg-table-caption').should('contain.text', 'Genomes');
    // Expect some rows
    cy.get('table.vf-table--striped tbody tr').should('have.length.at.least', 1);
    // Download button available via EMGTable custom download
    cy.get('[data-cy="emg-table-download-button"]').should('exist');
  });

  it('Shows All genomes search table and supports download', () => {
    openPage('browse/genomes?browseBy=search-all');
    waitForPageLoad('Browse MGnify');
    cy.get('table.vf-table--striped tbody tr').should('have.length', 2);
    // cy.get('.mg-table-caption').should('contain.text', 'Genomes (2)');
    cy.get('[data-cy="emg-table-download-button"]').should('exist');
  });
});
