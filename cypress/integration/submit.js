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
        before(function() {
            openPage(origPage);
            cy.contains('Please click here to login').click();
            cy.get(loginModal).should('be.visible');
            fillLoginModalForm();
        });
        it('Should display consent button', function() {
            openPage(origPage);
            cy.contains('Give consent').should('be.visible');
        });
        it('Should prevent clicking give consent without checking box', function() {
            openPage(origPage);
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.contains('Give consent.').click();
            cy.contains(errorText).should('be.visible');
        });
        it('Should create valid mailto link', function() {
            openPage(origPage);
            const errorText = 'Please check the box above.';
            cy.contains(errorText).should('be.hidden');
            cy.get('#consent-given').check({force: true});
            const mailToLink = 'mailto:metagenomics-help@ebi.ac.uk?subject=Request consent&' +
                'body=I consent for the MGnify team to analyse the ' +
                'private data of my account Webin-000.';
            cy.contains('Give consent.').then(($el) => {
                expect(Cypress.$($el).attr('href')).to.eq(mailToLink);
            });
            cy.contains(errorText).should('be.hidden');
        });
    });
});
