import {waitForPageLoad, openPage, openAndWait} from '../util/util';

describe('Genome catalogue page', () => {
  const catalogueIdValid = 'human-gut-v2-0';
  const catalogueNameValid = 'Human Gut v2.0'

  context('Genome list', () => {
    it('Should have structured overview data', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, catalogueNameValid);
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', '99')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Total genomes')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', '2')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Species-level clusters')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', 'FTP Site')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Download full catalogue')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', 'Pipeline v1.2.1')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'View workflow')
    });

    it('Should have table of genomes', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, catalogueNameValid);
      cy.get('.mg-table tbody tr').should('have.length', 3);
      const rowData = [null, 'MGYG000000001', '3219617', '4', '98.59', '0.7', 'Isolate', 'GCA-900066495 sp902362365', null];
      cy.get('.mg-table tbody tr:nth-child(1) td').each(($el, idx) => {
        if (rowData[idx]) {
          expect($el.text()).to.contain(rowData[idx]);
        }
      });
    });

    it('Should be searchable', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, catalogueNameValid);
      cy.get('#searchitem').type('sp902');
      cy.get('.mg-table tbody tr').should('have.length', 1);
    });

  });

  context('Taxonomy tree', () => {
    it('Should show tree', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid + '#phylo-tab', catalogueNameValid);
      cy.get('.mg-hierarchy-label').should('contain.text', 'Bacteria');
      cy.get(':nth-child(3) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get(':nth-child(7) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get('.mg-hierarchy-label').should('contain.text', 'Negativicutes');
    });

    context('Protein catalogue', () => {
      it('Should show catalogue description', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#protein-catalog-tab', catalogueNameValid);
        cy.get('#tab-protein-catalog-tab').should('contain.text', 'UHGP');
        cy.get('#tab-protein-catalog-tab').should('contain.text', 'Protein coding sequences');
      });
    });

    context('COBS gene fragment search', () => {
      it.skip('Should paste into query box', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-tab', catalogueNameValid);
        //TODO: no clipboard perms in chrome...
        cy.get('.vf-button').contains('Paste a sequence').click();
      });

      it('Should insert example', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-tab', catalogueNameValid);
        cy.intercept('POST',
          '**/genome-search**',
          {fixture: 'genomeSearch'}).as('genomeSearch');

        cy.get('.vf-button').contains('Use the example').click();
        cy.get('.ql-editor').should('contain.text', '>MGYG000000001_1');
        cy.get('#search-button').click();
        cy.get('h5').should('contain.text', 'COBS Results');
        cy.get('.mg-table tbody tr').should('have.length', 1);
        const rowData = [null, 'MGYG000000001', 'human-gut-v2-0', 'Isolate', 'GCA-900066495 sp902362365', '210', '210', '100'];
        cy.get('.mg-table tbody tr:nth-child(1) td').each(($el, idx) => {
          if (rowData[idx]) {
            expect($el.text()).to.contain(rowData[idx]);
          }
        });
      });
    });

    context('Sourmash mag search', () => {
      it('Should load sourmash component', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-mag-tab', catalogueNameValid);
        //TODO: no clipboard perms in chrome...
        cy.get('mgnify-sourmash-component#sourmash').should('be.visible');
      });
    });

  });

});