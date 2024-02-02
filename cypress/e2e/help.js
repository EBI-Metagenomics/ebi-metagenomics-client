import {openPage, isValidLink} from '../util/util';

const origPage = '';

describe('Help page', function() {
    context.skip('Refer from phmmer search', function() {
        it('Should highlight phmmer section', function() {
            cy.window().then((win) => {
                win.history.pushState(
                    'https://www.ebi.ac.uk/metagenomics/sequence-search/search/phmmer',
                    'hmmer-search');
                openPage(origPage + '?origin=phmmer');
                cy.get('#seq-search').should('have.class', 'highlight');
            });
        });
    });
    context('General', function() {
        before(function() {
            openPage('');
            // mosueover to open menu
            cy.get(`#help-section`).trigger('mouseover');
            cy.get(`#help-content-section a[href="/metagenomics/help"]`).click();
        });
        it('Elements should be present', function() {
            cy.get('h2').then(($h2) => {
                expect(Cypress.$($h2).text()).to.eq('Help');
            });
            cy.contains('User Documentation').should('be.visible');
            cy.contains('Sequence search').should('be.visible');
        });
        // Not always working because of FTP links
        it.skip('Links in help text should be valid', function() {
            cy.get('.mg-help-section a').each(($el) => {
                isValidLink($el);
            });
        });
    });
});
