import { openPage } from '../util/util';
import config from 'utils/config';

describe('Genome catalogue context', () => {
  const accession = 'MGYG000000001';
  const catalogue = 'human-gut-v2-0-2';

  beforeEach(() => {
    cy.intercept('GET', `${config.api_v2}genomes/${accession}*`, {
      fixture: 'apiv2/genomes/genomeDetail_MGYG000000001.json',
    }).as('genome');
    cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations*`, {
      fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
    }).as('annotations');
  });

  const checkRequests = (catalogueId) => {
    ['genome', 'annotations'].forEach((alias) => {
      cy.wait(`@${alias}`).then(({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('catalogue_id')).to.equal(catalogueId);
      });
    });
  };

  it('passes catalogue context from the catalogue list to both API endpoints', () => {
    cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogue}`, {
      fixture: 'apiv2/genomes/catalogueDetail_mar1.json',
    });
    cy.intercept('GET', `${config.api_v2}genomes/catalogues/${catalogue}/genomes*`, {
      fixture: 'apiv2/genomes/catalogue_mar1_genomes.json',
    });
    openPage(`genome-catalogues/${catalogue}`);
    cy.get('.mg-table').contains('a', accession)
      .should('have.attr', 'href', `/metagenomics/genomes/${accession}?catalogue=${catalogue}`)
      .click();
    cy.location('search').should('equal', `?catalogue=${catalogue}`);
    checkRequests(catalogue);
    cy.get('h2').should('contain', `Genome ${accession}`);

    cy.contains('a.vf-tabs__link', 'COG').click();
    cy.location('search').should('equal', `?catalogue=${catalogue}`);
    cy.location('hash').should('equal', '#cog-analysis');
    cy.get('[data-cy="genome-cog-analysis"]').should('be.visible');
    cy.reload();
    checkRequests(catalogue);
  });

  it('keeps API requests unchanged when no catalogue is supplied', () => {
    openPage(`genomes/${accession}`);
    checkRequests(null);
    cy.get('h2').should('contain', `Genome ${accession}`);
    cy.contains('a.vf-tabs__link', 'COG').click();
    cy.location('search').should('equal', '');
    cy.get('[data-cy="genome-cog-analysis"]').should('be.visible');
  });

  it('encodes catalogue context in API requests', () => {
    const catalogueId = 'preview catalogue&version=2';
    openPage(`genomes/${accession}?${new URLSearchParams({ catalogue: catalogueId })}`);
    checkRequests(catalogueId);
    cy.get('h2').should('contain', `Genome ${accession}`);
  });
});
