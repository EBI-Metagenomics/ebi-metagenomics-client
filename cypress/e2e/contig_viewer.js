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
    openPage('analyses/MGYA00000002/contigs-viewer/search-contigs');
    waitForPageLoad('Analysis MGYA00000002');
    cy.contains('Analysis MGYA00000002')
      .should('be.visible');
    cy.contains('File download required').should('be.visible');
    cy.contains('button', 'View & search contigs').click();
    cy.get('.Toastify__toast-body').should('contain', 'Downloading');
    cy.get('.Toastify__toast-body').should('contain', 'Indexed 6 assembly contigs');
    cy.contains('ERZ101_1')
      .should('be.visible');
    cy.contains('ERZ101_6')
      .should('be.visible');

    // MAP GFF should be shown too
    cy.contains('Additional GFFs shown are not searchable').should('be.visible');
    cy.contains('ERZ857107_user_mobilome_full.gff.gz').should('be.visible');
    cy.contains('ERZ101_1|inverted_repeat_element').should('be.visible');

    cy.get('#contig-search-all').should('have.attr', 'placeholder', 'Search GFF');
    cy.contains('button', 'IPR000771').click();
    cy.get('#contig-search-all').should('have.value', 'IPR000771').clear();

    cy.get('#contig-search-all').type('IPR003593');
    cy.location('search').should(
      'contain',
      'allAnnotationsSearch=IPR003593'
    );
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 3);
    cy.get('.vf-table__body code').should(
      'contain.text',
      'interpro=IPR003593;'
    );
    cy.get('.vf-table__body mark').should('have.text', 'IPR003593');
    cy.contains('Browsing 6 annotated contigs').should('be.visible');
    cy.get('#contig-search-all').clear();
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 6);

    cy.get('#contig-search-all').type('erz101_4');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 3);
    cy.get('.vf-table__body code').should('contain.text', 'Contig ID=ERZ101_4;');
    cy.get('.vf-table__body mark').should('have.text', 'ERZ101_4');
    cy.get('#contig-search-all').clear();
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 6);

    cy.get('#searchitem-interpro_').focus();
    cy.get('.mg-typeahead-suggestion').should('have.length.greaterThan', 0);

    cy.contains('summary', 'Gene Ontology term').click();
    cy.get('#contig_required_switch_gos').click();
    cy.location('search').should(
      'contain',
      'geneOntologyTermSearch=ANY'
    );
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
    cy.get('#contig_required_switch_gos').click();
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 6);

    cy.get('#searchitem-interpro_').type('IPR003593');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
    cy.get('#searchitem-interpro_').type('1');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
    cy.contains('button', 'Remove contig index').click();
    cy.get('.Toastify__toast-body').should('contain', 'Contig index removed');
  });

  it('Should load the bgzipped GFF preview only once', () => {
    openPage('analyses/MGYA00000002/contigs-viewer/gff-preview');
    waitForPageLoad('Analysis MGYA00000002');
    cy.get('[data-cy="assembly-tsv-table"], .compressed-tsv-table')
      .should('be.visible');
    cy.window().then((win) => {
      const countGffRequests = () =>
        win.performance
          .getEntriesByType('resource')
          .filter(({ name }) => name.includes('ERZ857107_annotation_summary.gff'))
          .length;
      const settledRequestCount = countGffRequests();
      cy.wait(500).then(() => {
        expect(countGffRequests()).to.equal(settledRequestCount);
      });
    });
  });
});
