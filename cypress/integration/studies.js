import {openPage} from './util';
const origPage = 'studies';

/**
 * Verify number of results responds to selector
 */
describe('Studies page', function() {
    it('Correct number of results.', function() {
        openPage(origPage);
        cy.wait(1000);
        cy.get('#pagesize').invoke('val').then((val) => {
            cy.get("table tr.study").should("have.length", parseInt(val));

            cy.get('#pagesize').select('50');
            cy.get("table tr.study").should("have.length", parseInt('50'));
        });
    });
});