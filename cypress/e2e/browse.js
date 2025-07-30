import {openPage, waitForPageLoad} from '../util/util';
import config from 'utils/config';

const origPage = 'browse';

describe('Browse page', function() {
    beforeEach(function() {
        cy.intercept('GET', `${config.api_v2}/super-studies/**`,
          {fixture: 'apiv2/super-studies/superStudiesList.json'});
    });

    context('Super studies table', function() {
        beforeEach(function() {
            openPage(origPage + '/super-studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of super studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(1)').should('contain.text', 'Excellent');
        });

        it('Should have markdown rendered description', function() {
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.html', '<strong>excellent adventure</strong>');
        });

        it('Should have download button', function() {
            cy.contains('Download').should('be.visible');
        });

    });
    context.skip('Studies table', function() {
        beforeEach(function() {
            openPage(origPage + '/studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.text', 'MGYS00000001');
        });

        it('Should respond to biome filtering', function() {
            cy.get('#biome-select').click();
            cy.contains('All Engineered').click();
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
            cy.contains('No matching data');
        });

    });
        //TODO list genome catalogues

        //TODO list biomes

        //TODO list publications

        //TODO list samples
});
