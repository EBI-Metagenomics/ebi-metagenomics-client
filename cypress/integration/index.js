import {openPage} from "./util";

const origPage = '/';

describe('Home page: Test Browse by selected biomes component', function () {
    context('Check for elements', function () {

        before(function () {
            openPage(origPage);
        });

        it('Browse by selected biomes"', function () {
            cy.get('#top10biomes').contains('By selected biomes');
        });

        it('Select specific biomes', function () {
            cy.get('#top10biomes').contains('Aquatic');
            cy.get('#top10biomes').contains('Plants');
            cy.get('#top10biomes').contains('Human');
        })

    });

    context('Perform click events', function () {

        beforeEach(function () {
            openPage(origPage);
        });

        it('Browse all biomes', function () {
            cy.contains('Browse all biomes').click();
        });

        it('Browse human biomes', function () {
            cy.get('#top10biomes').contains('Human').click();
        });
    })


});

describe('Home page: Test Browse latest projects component', function () {
    context('Check for elements', function () {

        before(function () {
            openPage(origPage);
        });

        it('Browse by latest projects"', function () {
            cy.get('#latestStudies').contains('Latest projects');
        })

    });

    context('Perform click events', function () {

        beforeEach(function () {
            openPage(origPage);
        });

        it('View all projects', function () {
            cy.contains('View all projects').click();
            cy.contains('Studies list');
            cy.title().should('include', 'Studies');
        });

        it('View specific study', function () {
            cy.contains('View more').click();
            cy.contains('Project');
            cy.title().should('include', 'Study');
        });
    })
});