import {openPage, isValidLink} from '../util/util';

const origPage = 'help';

describe('Help page', function() {
    // context('Refer from phmmer search', function() {
    //     beforeEach(function() {
    //         cy.window().then((win) => {
    //             win.history.pushState(
    //                 'https://www.ebi.ac.uk/metagenomics/sequence-search/search/phmmer',
    //                 'hmmer-search');
    //         });
    //         openPage(origPage).then(() => {
    //             cy.document()['referrer'] = 'https://www.ebi.ac.uk/metagenomics/sequence-search/search/phmmer';
    //             cy.document(
    //                 {referrer: 'sequence-search/search/phmmer'});
    //         });
    //
    //     });
    //     it('Should highlight phmmer section', function() {
    //         cy.document().then((doc) => {
    //             cy.log(doc['referrer']);
    //         });
    //         cy.get('#seq-search').should('have.class', 'highlight');
    //     });
    // });
    context('General', function() {
        before(function() {
            openPage(origPage);

        });
        it('Elements should be present', function() {
            cy.get('h2').then(($h2) => {
                expect(Cypress.$($h2).text()).to.eq('Help');
            });
            cy.contains('User Documentation').should('be.visible');
            cy.contains('Sequence search').should('be.visible');
        });
        it('Links in help text should be valid', function() {
            cy.get('#main-content-area a').each(($el) => {
                isValidLink($el);
            });
        });
    });
});
