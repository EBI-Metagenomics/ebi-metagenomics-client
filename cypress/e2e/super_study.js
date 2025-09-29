import {openPage, waitForPageLoad} from '../util/util';
import config from 'utils/config';

describe('Super Study page', function() {
    beforeEach(function() {
        cy.intercept('GET', `${config.api_v2}/super-studies/excellent`,
          {fixture: 'apiv2/super-studies/superStudyExcellent.json'});
        cy.intercept('GET', `**/fieldfiles/**logo.png`,
          {fixture: 'apiv2/super-studies/logo.png'});
    })
    const superStudyId = 'excellent';
    const origPage = 'super-studies/' + superStudyId;
    const pageTitle = 'Super Study';
    context('Landing', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
        });

        it('Verify elements are present', function() {
            cy.get('h2').should('contain', 'Super Study');
            cy.get('h3')
                .should('contain', 'Excellent Adventure');
            cy.get('[data-cy=\'superStudyDescription\']').should('contain.text', 'space and time');
            cy.get('[data-cy=\'superStudyLogo\']').should('be.visible');
        });
    });

    context('Flagship Projects table', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
        });

        it('Should have correct data', function() {
            cy.contains('Flagship Projects').should('be.visible');
            cy.contains('Flagship Projects').click();
            cy.get('[data-cy="superStudyFlagshipTable"]').should('contain.text', 'MGYS00000001');
            cy.get('[data-cy="superStudyFlagshipTable"] .vf-table__body > .vf-table__row').should('have.length', 1);
        });
    });

    context('Related Projects table', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
        });

        it('Should be present with empty table', function() {
            cy.contains('Related Projects').should('be.visible');
            cy.contains('Related Projects').click();
            cy.get('[data-cy="superStudyRelatedTable"]').should('contain.text', 'No matching data');
        });
    });

    context('MAG Catalogues table', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
        });

        it('Should have correct data', function() {
            cy.contains('Related Genome Catalogues').should('be.visible');
            cy.contains('Related Genome Catalogues').click();
            cy.get('[data-cy="superStudyCataloguesTable"]').should('contain.text', 'human-gut-v2-0');
            cy.get('[data-cy="superStudyCataloguesTable"] .vf-table__body > .vf-table__row').should('have.length', 1);
        });
    });

    context('Error handling', function() {
        it('Should display error message if invalid super study Id passed in URL', function() {
            const superStudyId = '99';
            const origPage = 'super-studies/' + superStudyId;
            openPage(origPage);
            cy.contains('Error Fetching Data');
        });
    });
});
