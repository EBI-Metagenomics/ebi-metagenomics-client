const navNames = ['overview', 'search', 'submit', 'browse', 'about', 'help'];
const pageTitles = [
    'Browse projects', 'Search', 'Submit data', 'Studies list',
    'About', 'Help'];
import {openPage, getPageURL} from '../util/util';

const origPage = 'overview';
/**
 * Check all links in navbar towards other pages of the site are functional
 */
describe('Navbar test', function() {
    for (let dest = 1; dest < navNames.length; dest++) {
        const destPage = navNames[dest];
        context(origPage + '->' + destPage, function() {
            it('Navbar link is valid.', function() {
                openPage(origPage);
                cy.get('#' + destPage + '-nav').click();

                if (origPage !== 'overview') {
                    cy.url().should('include', destPage);
                }
                cy.get('h2').should('contain', pageTitles[dest]);
            });
        });
    }
});

/**
 * Check that search redirects correctly and passes parameter via URL
 */
const testQuery = 'testQuery';
describe('Search bar redirection', function() {
    context(origPage + ' - Search redirects correctly', function() {
        it('Navbar search re-directed correctly.', function() {
            openPage(origPage);
            cy.get('#headerSearchForm > input').type(testQuery);
            cy.get('#search').click();
            cy.url().should('include', 'search?query=' + testQuery);
        });
    });
});
const pagesBreadcrumbs = {
    'about': [''],
    'biomes': [''],
    // 'compare': '',
    'help': [''],
    // 'login': [''],
    'pipelines/4.0': ['', 'pipelines'],
    'pipelines': [''],
    'analyses/MGYA00141547': ['', 'studies/MGYS00000553', 'samples/ERS853149', 'runs/ERR1022502'],
    'samples/ERS1474828': ['', 'browse#samples'],
    'browse': [''],
    'search': [''],
    'studies/ERP000118': ['', 'browse#studies'],
    'submit': ['']
};

describe('Validate breadcrumb links are valid.', function() {
    for (let page in pagesBreadcrumbs) {
        if (pagesBreadcrumbs.hasOwnProperty((page))) {
            context(page + ' page.', function() {
                const breadcrumbs = pagesBreadcrumbs[page];
                it('Link validity', function() {
                    for (let i in breadcrumbs) {
                        if (Object.prototype.hasOwnProperty.call(breadcrumbs, i)) {
                            openPage(page);
                            const expectedPage = breadcrumbs[i];
                            cy.get('.breadcrumbs>li>a').each(($el, index) => {
                                if (parseInt(i) === parseInt(index)) {
                                    cy.wrap($el).click();
                                    cy.url().should('equal', getPageURL(expectedPage));
                                    openPage(page);
                                }
                            });
                        }
                    }
                });
            });
        }
    }
});

describe('External link to HMMER sequence search redirects correctly', function() {
    it('Navbar link to sequence search is valid.', function() {
        openPage('overview');
        cy.get('#sequence-search-nav > a ').then(($link) => {
            expect(Cypress.$($link).attr('href'))
                .to
                .eq('https://wwwdev.ebi.ac.uk/metagenomics/sequence-search/search/phmmer');
        });
    });
});

// TODO Fix HMMER sequence link check
