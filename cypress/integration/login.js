import {openPage, waitForPageLoad} from './util';
import GenericTableHandler from './genericTable';

const origPage = '';
const loginButton = '[data-cy=\'login\']';
const myDataBtn = '[data-cy=\'mydata\']';
const logoutButton = '[data-cy=\'logout\']:visible';
const loginModal = '[data-cy=\'loginModal\']';
const usernameInput = 'input[name=\'username\']';
const passwordInput = 'input[name=\'password\'][type=\'password\']';
const username = Cypress.env('WEBIN_USERNAME');
const password = Cypress.env('WEBIN_PASSWORD');

Cypress.Cookies.debug(true);

Cypress.Cookies.defaults({
    whitelist: 'csrftoken'
});

let table;
const privateStudy = 'ERP104179';

function openModal() {
    cy.get(loginModal).should('be.hidden');
    cy.get(loginButton).click();
    cy.get(loginModal).should('be.visible');
}

function login() {
    cy.get(loginButton).click();
    cy.get(usernameInput).type(username);
    cy.get(passwordInput).type(password);
    cy.get(loginModal).find('input[name=\'submit\']').click();
    waitForPageLoad('My studies');
    cy.get(loginModal).should('be.hidden');
    cy.get(loginButton).should('not.exist');
    cy.get(logoutButton).should('be.visible');
    cy.get(myDataBtn).should('be.visible').contains('Welcome, ' + username);
}

describe('Login process', function() {
    context('Login modal', function() {
        beforeEach(function() {
            openPage(origPage);
        });

        it('Should contain all elements', function() {
            cy.get(loginButton).should('be.visible').click();
            cy.get(loginModal).find(usernameInput).should('be.visible');
            cy.get(loginModal)
                .find(passwordInput)
                .should('be.visible');
            cy.get(loginModal).find('.form-forgotten a').contains('Forgot your password?');
        });

        it('Should close on click (via close button)', function() {
            openModal();
            cy.get(loginModal).find('a').contains('Cancel').click();
            cy.get(loginModal).should('be.hidden');
        });

        it('Should close on click (via cancel button)', function() {
            openModal();
            cy.get(loginModal).find('.close-button').click();
            cy.get(loginModal).should('be.hidden');
        });

        it('Login process', function() {
            login();
        });
        it('Viewing private data', function() {
            login();
            table = new GenericTableHandler('#studies-section', 3);
            table.checkRowData(0, [
                '',
                'ERP104178',
                'EMG produced TPA metagenomics assembly of the Microbial Community',
                'The Mobilong Soil Profile Third Party Annotation (TPA) assembly was derived ' +
                'from the primary whole genome shotgun (WGS) data set PRJEB5872.',
                '2',
                '15-Nov-2017']);
            table.checkRowData(1, [
                '',
                'ERP104179',
                'EMG produced TPA metagenomics assembly of the Microbial Community',
                'The Mobilong Soil Profile Third Party Annotation (TPA) assembly was derived ' +
                'from the primary whole genome shotgun (WGS) data set PRJEB5872.',
                '0',
                '15-Nov-2017']);
            table.checkRowData(2, [
                '',
                'ERP104236',
                'EMG produced TPA metagenomics assembly of the Identification of fungi',
                'The human wound Third Party Annotation (TPA) assembly was derived from the' +
                ' primary whole genome shotgun (WGS) data set PRJNA344941',
                '5',
                '24-Nov-2017']);
        });

        it('Viewing private study on study page', function() {
            login();
            openPage('studies/' + privateStudy);
            cy.get('h2').contains('EMG produced TPA metagenomics assembly of the Microbial' +
                ' Community of Mobilong Acid Sulfate Soil depth profile using Metagenomics' +
                ' (Mobilong Soil Profile) data set');
        });

        it('Logout should redirect to overview', function() {
            login();
            cy.get(logoutButton).click();
            cy.get('.getting-started-banner').find('h2').contains('Getting started');
        });
    });
    context('Edge cases', function() {
        it('Display error message when accessing mydata page without being logged in', function() {
            openPage('mydata');
            cy.get('h2').contains('Oh no! An error has occured!');
            cy.get('h3').contains('You are not logged in.');
            cy.get('#main-content-area p').contains('Click here to login and view your data.');
            cy.get('#main-content-area a').click();
            cy.get(loginModal).should('be.visible');
        });
        it('Accessing private study when not logged in should display error', function() {
            openPage('studies/' + privateStudy);
            cy.get('h2').contains('Oh no! An error has occured!');
            cy.get('h3').contains('Error: 404');
            cy.get('p').contains('Could not retrieve study: ERP104179');
        });
    });
});
