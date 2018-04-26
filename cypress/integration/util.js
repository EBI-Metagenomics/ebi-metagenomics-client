import Config from './config';

const username = Cypress.env('WEBIN_USERNAME');
const password = Cypress.env('WEBIN_PASSWORD');

let Util = {
    getBaseURL: function() {
        return Config.BASE_URL;
    },
    getPageURL: function(page) {
        return Config.BASE_URL + (page !== 'overview' ? page : '');
    },
    openPage: function(page) {
        cy.visit(Util.getPageURL(page));
    },
    waitForPageLoad: function(title) {
        cy.get('h2').should('contain', title);
    },
    waitForBiomesLoad: function(results) {
        cy.get('table tr.biome', {timeout: 10000}).should('have.length', parseInt(results));
    },
    waitForSearchResults: function(rowSelector, numResults) {
        cy.get(rowSelector, {timeout: 40000}).should('have.length', parseInt(numResults));
    },
    assertTableIsCleared: function() {
        cy.get('table tr.sample').should('not.exist');
    },
    changeTab: function(tabName) {
        cy.get('ul.tabs > li.tabs-title a[href=\'#' + tabName + '\']').click();
    },
    urlExists: function(url) {
        cy.request(url);
    },
    stripWhitespace: function(str) {
        return str.replace(/\s/g, '');
    },
    datatype: {
        STR: 0,
        NUM: 1,
        DATE: 2
    },
    loginButton: '[data-cy=\'login\']',
    logoutButton: '[data-cy=\'logout\']:visible',
    myDataBtn: '[data-cy=\'mydata\']',
    loginModal: '[data-cy=\'loginModal\']',
    usernameInput: 'input[name=\'username\']',
    passwordInput: 'input[name=\'password\'][type=\'password\']',
    login: function() {
        cy.get(Util.loginButton).click();
        cy.get(Util.usernameInput).type(username);
        cy.get(Util.passwordInput).type(password);
        cy.get(Util.loginModal).find('input[name=\'submit\']').click();
        Util.waitForPageLoad('My studies');
        cy.get(Util.loginModal).should('be.hidden');
        cy.get(Util.loginButton).should('not.exist');
        cy.get(Util.logoutButton).should('be.visible');
        cy.get(Util.myDataBtn).should('be.visible').contains('Welcome, ' + username);
    }
};
module.exports = Util;
