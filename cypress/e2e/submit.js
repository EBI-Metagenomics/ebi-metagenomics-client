import {openPage, loginModal, fillLoginModalForm} from '../util/util';

const origPage = 'submit';
describe.skip('Submit page', function() {
    context('User not logged in', function() {
        before(function() {
            openPage(origPage);
        });
        it('Elements should be visible', function() {
            cy.contains('Submit data').should('be.visible');
            cy.contains('Login with Webin').should('be.visible');
        });
    });
    context('User is logged in, consent not already given', function() {
        beforeEach(function() {
            openPage(origPage);
            cy.contains('Login with Webin').click();
            cy.get(loginModal).should('be.visible');
            fillLoginModalForm();
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
    });
    // TODO re-enable once source of flake is discovered
    // see https://github.com/cypress-io/cypress/issues/2416#issuecomment-417375615
    // context('User is logged in, successful workflow', function() {
    //     it('Should send request and display success', function() {
    //         cy.server();
    //         cy.route({
    //             method: 'POST',
    //             url: '**/utils/notify',
    //             status: 201,
    //             response: []
    //         }).as('sendMail');
    //
    //         openPage(origPage);
    //         cy.contains('Please click here to login').click();
    //         cy.get(loginModal).should('be.visible');
    //         fillLoginModalForm();
    //         cy.contains('Your Webin account is currently not registered with MGnify')
    //             .should('be.visible');
    //         const errorText = 'Please check the box above.';
    //         cy.contains(errorText).should('be.hidden');
    //         cy.contains('Give consent.').should('be.visible');
    //         cy.get('#consent-given').check();
    //         cy.wait(2000);
    //         cy.contains('Give consent.').click();
    //         cy.contains('Give consent.').click({force: true});
    //         cy.contains(errorText).should('be.hidden');
    //         cy.wait('@sendMail');
    //         cy.get('#consent-request-error').should('be.hidden');
    //         cy.get('#consent-request-success').should('be.visible');
    //
    //         // Check error link validity
    //         cy.get('#consent-request-success a').then(($el) => {
    //             isValidLink($el);
    //         });
    //     });
    // });
    context('User is logged in, consent already given', function() {
        beforeEach(function() {
            cy.intercept('GET', '**/myaccounts', 'fixture:user_account_with_consent');
            openPage(origPage);
            cy.contains('Submit data').should('be.visible');
        });
        it('Should display submit data button', function() {
            cy.contains('Give consent.').should('not.exist');
            cy.contains('Click here to submit data').should('be.visible');
        });
    });
});
