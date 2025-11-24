import { openPage, waitForPageLoad } from '../util/util.js';
import config from 'utils/config';

describe('Contig viewer and indexer on bgzipped gffs', () => {
  beforeEach(function() {
    cy.window().then((win) => {
      return new Cypress.Promise((resolve, reject) => {
        const req = win.indexedDB.deleteDatabase('gffdb');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve(); // best-effort in case something still holds it
      });
    });

    cy.intercept('GET', `${config.api_v2}/analyses/MGYA00000002`,
      {fixture: 'apiv2/analyses/analysisMGYA00000002.json'});
  })
  it('Should be able to index bgzipped gff', () => {
    openPage('v2-analyses/MGYA00000002/contigs-viewer/search-contigs');
    waitForPageLoad('Analysis MGYA00000002');
    cy.contains('Analysis MGYA00000002')
      .should('be.visible');
    cy.contains('File download required').should('be.visible');
    cy.contains('button', 'Download & index GFF').click();
    cy.get('.Toastify__toast-body').should('contain', 'Downloading');
    cy.get('.Toastify__toast-body').should('contain', 'Indexed 6 assembly contigs');
    cy.contains('ERZ101_1')
      .should('be.visible');
    cy.contains('ERZ101_6')
      .should('be.visible');
    cy.get('#searchitem-interpro_').type('IPR003593');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
    cy.get('#searchitem-interpro_').type('1');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
    cy.contains('button', 'Remove contig index').click();
    cy.get('.Toastify__toast-body').should('contain', 'Contig index removed');
  });
});