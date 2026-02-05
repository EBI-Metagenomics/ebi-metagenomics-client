import { openAndWait } from '../util/util';
import config from 'utils/config';

describe('Genome catalogue page', () => {
  const catalogueIdValid = 'human-gut-v2-0-2';
  const catalogueNameValid = 'Human Gut v2.0.2'

  beforeEach(() => {
    cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogueIdValid}`, {
      fixture: 'apiv2/genomes/catalogueDetail_mar1.json',
    }).as('catalogueDetail');
    cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogueIdValid}/genomes**`, {
      fixture: 'apiv2/genomes/catalogue_mar1_genomes.json',
    }).as('catalogueGenomes');
    cy.intercept('GET', `**/genomes/catalogues/${catalogueIdValid}/genomes?*ordering=accession*`, {
      fixture: 'apiv2/genomes/catalogue_mar1_genomes.json',
    }).as('catalogueGenomesOrdering');
    cy.intercept('GET', `**/genomes/MGYG000000001/downloads/MGYG000000001.fna*`, {
      body: '>MGYG000000001_1\nATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC'
    }).as('exampleFasta');
  });

  context('Genome list', () => {
    it('Should have structured overview data', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', '8')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Total genomes')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', '5')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Species-level clusters')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', 'FTP Site')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'Download full catalogue')

      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__heading').should('contain.text', 'Pipeline v1.0.0')
      cy.get('.vf-body > .vf-content .vf-card__content .vf-card__subheading').should('contain.text', 'View workflow & tools')
    });

    it('Should have table of genomes', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.get('.mg-table tbody tr').should('have.length', 2);
      const rowData = [null, 'MGYG000000001', '123456', '10', '95', '2', 'MAG'];
      cy.get('.mg-table tbody tr:nth-child(1) td').each(($el, idx) => {
        if (rowData[idx]) {
          expect($el.text()).to.contain(rowData[idx]);
        }
      });
    });

    it('Should be searchable', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogueIdValid}/genomes?**search=MGYG000000001**`, {
        body: {
          count: 1,
          items: [
            {
              accession: "MGYG000000001",
              length: 123456,
              num_contigs: 10,
              completeness: 95,
              contamination: 2,
              type: "MAG",
              biome: {"lineage": "root:Environmental:Marine"}
            }
          ]
        }
      }).as('searchGenomes');

      cy.get('#searchitem').type('MGYG000000001');
      cy.get('.mg-table tbody tr').should('have.length', 1);
    });

  });

  context('Taxonomy tree', () => {
    it.skip('Should show tree', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid + '#phylo-tab', catalogueNameValid);
      cy.get('.mg-hierarchy-label').should('contain.text', 'Bacteria');
      cy.get(':nth-child(3) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get(':nth-child(7) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get('.mg-hierarchy-label').should('contain.text', 'Negativicutes');
    });

    context('Protein catalogue', () => {
      it.skip('Should show catalogue description', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#protein-catalog-tab', catalogueNameValid);
        cy.get('#tab-protein-catalog-tab').should('contain.text', 'UHGP');
        cy.get('#tab-protein-catalog-tab').should('contain.text', 'Protein coding sequences');
      });
    });

    context('COBS gene fragment search', () => {
      it.skip('Should paste into query box', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-tab', 'Marine MAGs');
        //TODO: no clipboard perms in chrome...
        cy.get('.vf-button').contains('Paste a sequence').click();
      });

      it.skip('Should insert example', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-tab', 'Marine MAGs');
        cy.intercept('POST',
          '**/genome-search**',
          {
            body: [
              {
                accession: "MGYG000000001",
                catalogue: "human-gut-v2-0-2",
                genome_type: "Isolate",
                lineage: "GCA-900066495 sp902362365",
                kmer_count: "210",
                query_size: "210",
                overlap: "100"
              }
            ]
          }).as('genomeSearch');

        cy.get('.vf-button').contains('Use the example').click();
        // cy.wait('@exampleFasta');
        // cy.get('.ql-editor').should('contain.text', 'MGYG000000001_1');
        cy.get('#search-button').click();
        cy.get('h5').should('contain.text', 'COBS Results');
        cy.get('.mg-table tbody tr').should('have.length', 1);
        const rowData = [null, 'MGYG000000001', 'human-gut-v2-0-2', 'Isolate', 'GCA-900066495 sp902362365', '210', '210', '100'];
        cy.get('.mg-table tbody tr:nth-child(1) td').each(($el, idx) => {
          if (rowData[idx]) {
            expect($el.text()).to.contain(rowData[idx]);
          }
        });
      });
    });

    context('Sourmash mag search', () => {
      it('Should load sourmash component', () => {
        openAndWait('genome-catalogues/' + catalogueIdValid + '#genome-search-mag-tab', 'Marine MAGs');
        //TODO: no clipboard perms in chrome...
        cy.get('#genome-search-mag').should('be.visible');
      });
    });

  });

});