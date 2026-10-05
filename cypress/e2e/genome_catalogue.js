import { openAndWait } from '../util/util';
import config from 'utils/config';

describe('Genome catalogue page', () => {
  const catalogueIdValid = 'human-gut-v2-0-2';

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
      const stats = [
        ['Species representatives', '5'],
        ['Genomes', '8'],
        ['Last updated', '01/10/2024'],
        ['Catalogue type', 'Mag'],
        ['Total proteins', '1,000'],
        ['Clusters with pan-genomes', '10'],
        ['Clusters with isolate genomes', '5'],
        ['View workflow & tools', 'Pipeline v1.0.0'],
      ];
      stats.forEach(([label, value]) => {
        cy.contains('.vf-card__subheading', new RegExp(`^${label}$`))
          .closest('.vf-card')
          .find('.vf-card__heading')
          .should(($heading) => {
            expect($heading.text().trim()).to.equal(value);
          });
      });
    });

    it('Should have table of genomes', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.get('.mg-table tbody tr').should('have.length', 2);
      const headers = ['Accession', 'Taxonomy', 'Type', 'Completeness', 'Contamination', 'Length (MB)', 'N50', 'GC%'];
      cy.get('.mg-table thead th').should('have.length', headers.length).each(($el, idx) => {
        expect($el.text()).to.contain(headers[idx]);
      });
      const rowData = ['MGYG000000001', 'Bacillus subtilis', 'MAG', '95.00%', '2.00%', '0.12', '12,345', '42.50%'];
      cy.get('.mg-table tbody tr:first-child td').should('have.length', rowData.length).each(($el, idx) => {
        expect($el.text().trim()).to.equal(rowData[idx]);
      });
    });

    it('Should be searchable', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.fixture('apiv2/genomes/catalogue_mar1_genomes.json').then(({ items }) => {
        cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogueIdValid}/genomes?**search=MGYG000000001**`, {
          body: { count: 1, items: [items[0]] },
        }).as('searchGenomes');
      });

      cy.get('#searchitem').type('MGYG000000001');
      cy.wait('@searchGenomes');
      cy.get('.mg-table tbody tr').should('have.length', 1);
    });

  });

  context('Downloads', () => {
    it('Should show catalogue and protein downloads on the main page', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid, 'Marine MAGs');
      cy.contains('h3', 'Downloads').closest('section').within(() => {
        cy.contains('.vf-flag', 'Marine MAGs genome catalogue').within(() => {
          cy.contains('a', 'FTP site').should('have.attr', 'href', 'https://ftp.ebi.ac.uk/pub/databases/metagenomics/mgnify_genomes/');
        });
        cy.contains('.vf-flag', 'UHGP').within(() => {
          cy.contains('Protein coding sequences from the human gut.').should('be.visible');
          cy.contains('a', 'FTP site').should('have.attr', 'href', 'https://ftp.ebi.ac.uk/pub/databases/metagenomics/mgnify_genomes/');
        });
      });
    });
  });

  context('Taxonomy tree', () => {
    it.skip('Should show tree', () => {
      openAndWait('genome-catalogues/' + catalogueIdValid + '#phylo-tab', 'Marine MAGs');
      cy.get('.mg-hierarchy-label').should('contain.text', 'Bacteria');
      cy.get(':nth-child(3) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get(':nth-child(7) > .mg-hierarchy-selector > .mg-expander').click();
      cy.get('.mg-hierarchy-label').should('contain.text', 'Negativicutes');
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
