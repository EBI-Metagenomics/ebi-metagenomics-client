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

  it('Shows Gene search (COBS) and supports switching tabs', () => {
    openPage('browse/genomes');
    waitForPageLoad('Browse MGnify');

    // Default tab should be biome (Catalogues list)
    cy.get('table.vf-table--striped tbody tr').should('have.length.at.least', 1);

    // Click on Gene search
    cy.contains('.vf-tabs__link', 'Gene search').click();
    cy.url().should('include', 'browseBy=gene-search');
    cy.contains('h3', 'Search DNA fragments across catalogues').should('be.visible');

    // Click on MAG search
    cy.contains('.vf-tabs__link', 'MAG search').click();
    cy.url().should('include', 'browseBy=mag-search');
    cy.contains('h3', 'Search MAG files across catalogues').should('be.visible');

    // Click back to All genomes
    cy.contains('.vf-tabs__link', 'All genomes').click();
    cy.url().should('include', 'browseBy=search-all');
    cy.get('table.vf-table--striped tbody tr').should('have.length', 2);
  });
});
