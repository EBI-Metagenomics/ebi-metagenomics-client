import Config from './config';

export let Util = {
    getBaseURL: function() {
        return Config.BASE_URL;
    },
    getPageURL: function(page) {
        return Config.BASE_URL + (page !== 'overview' ? page : '');
    },
    openPage: function(page) {
        return cy.visit(Util.getPageURL(page));
    },
    waitForPageLoad: function(title) {
        cy.get('h2').should('contain', title);
    },
    waitForBiomesLoad: function(results) {
        cy.get('table tbody tr', {timeout: 10000}).should('have.length', parseInt(results));
    },
    waitForSearchResults: function(rowSelector, numResults) {
        cy.get(rowSelector, {timeout: 10000}).should('have.length', parseInt(numResults));
    },
    assertTableIsCleared: function() {
        cy.get('table tr.sample').should('not.exist');
    },
    changeTab: function(tabName) {
        cy.get('ul.tabs > li.tabs-title a[href=\'#' + tabName + '\']').click();
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

    username: Cypress.env('WEBIN_USERNAME'),
    password: Cypress.env('WEBIN_PASSWORD'),

    checkIsLoggedIn: function() {
        cy.get(Util.loginModal).should('be.hidden');
        cy.get(Util.loginButton).should('not.exist');
        cy.get(Util.logoutButton).should('be.visible');
    },
    fillLoginModalForm: function() {
        cy.get(Util.usernameInput).type(Util.username);
        cy.get(Util.passwordInput).type(Util.password);
        cy.get(Util.loginModal).find('input[name=\'submit\']').click();
    },
    login: function() {
        cy.get(Util.loginButton).click();
        Util.fillLoginModalForm();
        Util.waitForPageLoad('My studies');
        Util.checkIsLoggedIn();
        cy.get(Util.myDataBtn).should('be.visible');
    },
    setupDefaultSearchPageRouting: function() {
        cy.server();

        cy.route({
            'method': 'HEAD',
            'url': 'http://localhost:8000/v1/',
            'status': 200,
            'response': {}
        });

        // Basic page load
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_projects?format=json&size=25&start=0&**' +
            'facetcount=10&' +
            'facetsdepth=5&facets=&query=domain_source:metagenomics_projects',
            'fixture:projectsInitQuery.json').as('basicProjects');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_projects?format=json&size=1&start=0&' +
            'facetcount=10&' +
            'facetsdepth=3&query=domain_source:metagenomics_projects',
            'fixture:projectsInitFilters.json').as('basicProjectFilters');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?format=json&size=25&start=0&**' +
            'facetcount=10&' +
            'facetsdepth=5&facets=&query=domain_source:metagenomics_samples',
            'fixture:samplesInitQuery.json').as('basicSamples');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?format=json&size=1&start=0&facetcount=10&' +
            'facetsdepth=3&query=domain_source:metagenomics_samples',
            'fixture:samplesInitFilters.json').as('basicSampleFilters');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?format=json&size=25&start=0&**facetcount=10&' +
            'facetsdepth=5&facets=&query=domain_source:metagenomics_analyses',
            'fixture:analysesInitQuery.json').as('basicAnalyses');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?format=json&size=1&start=0&facetcount=10&' +
            'facetsdepth=3&query=domain_source:metagenomics_analyses',
            'fixture:analysesInitFilters.json').as('basicAnalysesFilters');
    },
    isValidLink: function($el, status) {
        const opts = {};
        if (status != 200) {
            opts.failOnStatusCode = false;
        }
        opts.url = Cypress.$($el).attr('href');
        cy.request(opts).then((resp) => {
            expect(resp['status']).to.eq(status || 200);
        });
    }
};
module.exports = Util;
