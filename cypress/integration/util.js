import Config from './config';

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
    }
};
module.exports = Util;
