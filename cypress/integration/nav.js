// const navNames = ['overview', 'search', 'submit', 'studies', 'samples', 'compare', 'about', 'contact'];
const navNames = ['overview', 'search', 'submit', 'studies', 'samples', 'about', 'help'];
// const pageTitles = ['Browse projects', 'Search EBI Metagenomics', 'Submit data', 'Studies list', 'Samples list', 'Comparison tool', 'About EBI metagenomics', 'Contact us'];
const pageTitles = ['Browse projects', 'Search EBI Metagenomics', 'Submit data', 'Studies list', 'Samples list', 'About EBI metagenomics', 'EBI Metagenomics Help'];
import {openPage} from './util';

/**
 * Check all links in navbar towards other pages of the site are functional
 */
for (let orig = 0; orig < navNames.length; orig++) {
    for (let dest = 1; dest < navNames.length; dest++) {
        const origPage = navNames[orig];
        const destPage = navNames[dest];
        describe('Nav test ' + origPage + '->' + destPage, function () {
            it('Navbar link is valid.', function () {
                openPage(origPage);
                cy.get('#' + destPage + '-nav').click();

                if (origPage !== 'overview') {
                    cy.url().should('include', destPage);
                }
                cy.get('h2').should('contain', pageTitles[dest]);
            });
        });
    }
}

/**
 * Check that search redirects correctly and passes parameter via URL
 */
const testQuery = 'testQuery';
for (let orig = 0; orig < navNames.length; orig++) {
    const origPage = navNames[orig];
    describe(origPage + ' - Search redirects correctly', function () {
        it('Navbar search re-directed correctly.', function () {
            openPage(origPage);
            cy.get("#headerSearchForm input").type(testQuery);
            cy.get('#search').click();
            cy.url().should('include', 'search?query=' + testQuery);
        });
    });
}

// describe('External link to HMMER sequence search redirects correctly', function () {
//     it('Navbar link to sequence search is valid.', function () {
//         openPage('overview');
//         cy.get('#sequence-search-nav > a ').then(($link) => {
//             const url = $link.attr('href');
//             cy.log($link);
//             cy.request({
//                 url: url,
//                 followRedirect: true
//             }). then((resp) => {
//                 expect(resp.status).to.eq(200)
//                 expect(url).to.contain('sequence-search/search/phmmer')
//             })
//         });
//
//
//     });
// });

// TODO Fix HMMER sequence link check