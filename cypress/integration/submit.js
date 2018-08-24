import {openPage, loginModal, fillLoginModalForm} from '../util/util';

const origPage = 'submit';
describe('Submit page', function() {
    context('User not logged in', function() {
        before(function() {
            openPage(origPage);
        });
        it('Elements should be visible', function() {
            cy.contains('Submit data').should('be.visible');
            cy.contains('Please click here to login').should('be.visible');
        });
    });
    context('User is logged in', function() {
        beforeEach(function() {
            openPage(origPage);
            cy.contains('Please click here to login').click();
            cy.get(loginModal).should('be.visible');
            fillLoginModalForm();
            cy.window().then((win) => {
                cy.spy(win.console, 'log');
                cy.spy(win.console, 'error');
            });
        });
        it('Should display consent button', function() {
            cy.contains('Give consent').should('be.visible');
        });
        it('Should prevent clicking give consent without checking box', function() {
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.contains(errorText).should('be.visible');
        });
        it('Should create consent given email request', function() {
            cy.server();
            cy.route('POST', '**').as('notifyRequest');
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').should('be.visible');
            cy.get('#consent-given').check();
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.wait('@notifyRequest', {timeout: 5000});
        });
    });
});
