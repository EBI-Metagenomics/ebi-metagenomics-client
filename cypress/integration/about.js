import {openPage} from './util';

const origPage = 'about';

describe('About page - Dropdown citations view', function() {
    beforeEach(function() {
        openPage(origPage);
    });
    it('Clicking button should display / hide publications', function() {
        const citationDiv = '#extra_citation';
        const button = 'a.expand-button';
        cy.get(citationDiv).should('be.hidden');
        cy.get(button).click();
        cy.get(citationDiv).should('be.visible');
        cy.get(button).click();
        cy.get(citationDiv).should('be.hidden');
    });
});
