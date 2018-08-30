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
            cy.server();
            cy.route('GET', '**/myaccounts', 'fixture:user_account');
            openPage(origPage);
            cy.contains('Submit data').should('be.visible');
            // cy.contains('Please click here to login').should('be.visible');
            // cy.contains('Please click here to login').click();
            // cy.get(loginModal).should('be.visible');
            // fillLoginModalForm();
        });
        it('Should display consent button if logged in but consent not given', function() {
            cy.contains('Give consent').should('be.visible');
        });
        it('Should prevent clicking give consent without checking box', function() {
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.contains(errorText).should('be.visible');
        });
        it('Should display error message if consent request failed', function() {
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').should('be.visible');
            cy.get('#consent-given').check();
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.get('#consent-request-error').should('be.visible');
            cy.get('#consent-request-success').should('be.hidden');
        });
        it('Should display success message if consent request failed', function() {
            cy.route({
                method: 'POST',
                url: '**',
                status: 201,
                response: []
            }).as('notifyRequest');
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').should('be.visible');
            cy.get('#consent-given').check();
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.get('#consent-request-error').should('be.hidden');
            cy.get('#consent-request-success').should('be.visible');
        });
    });
});
