import {openPage} from './util';
const origPage = 'studies';

describe('Studies page', function() {
    it('Correct number of results.', function() {
        openPage(origPage);
        cy.get('#pagesize').invoke('val').then((val) => {
            cy.get("table tr.study").should("have.length", parseInt(val))

            // cy.get('#pagesize').select('50');
            // expect(cy.get('tr.study').length).to.eq(parseInt('50'));
        });
    });
});