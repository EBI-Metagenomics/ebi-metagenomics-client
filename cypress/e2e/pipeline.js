import {openPage} from '../util/util';

const origPage = 'pipelines/';

describe('Pipeline page', function() {
    context('Pipeline version 1.0', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '1');
            cy.contains('Pipeline version 1.0').should('be.visible');
        });
    });
    context('Pipeline version 2.0', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '2');
            cy.contains('Pipeline version 2.0').should('be.visible');
        });
    });
    context('Pipeline version 3.0', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '3');
            cy.contains('Pipeline version 3.0').should('be.visible');
        });
    });
    context('Pipeline version 4.0', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '4');
            cy.contains('Pipeline version 4.0').should('be.visible');
        });
    });
    context('Pipeline version 4.1', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '4.1');
            cy.contains('Pipeline version 4.1').should('be.visible');
        });
    });
    context('Should load using float', function() {
        it('Should load page using float URL argument', function() {
            openPage(origPage + '4.0');
            cy.contains('Pipeline version 4.0').should('be.visible');
        });
    });
    context('Pipeline version 5.0', function() {
        it('Page should load correctly', function() {
            openPage(origPage + '5');
            cy.contains('Pipeline version 5.0').should('be.visible');
        });
    });
    context('Non-existant pipeline version', function() {
        it('Should display error if pipeline version does not exist', function() {
            openPage(origPage + '4.5');
            cy.contains(
                'No pipeline version found, available versions are 1.0, 2.0, 3.0, 4.0, 4.1 & 5.0');
        });
    });
});
