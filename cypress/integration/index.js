import {openPage, getBaseURL} from "./util";

const origPage = '';

describe('Home page: Test Browse by selected biomes component', function () {
    context('Check for elements', function () {
        before(function () {
            openPage(origPage);
        });

        it('Browse by selected biomes"', function () {
            cy.get('#top10biomes').contains('By selected biomes');
        });

        it('Select specific biomes', function () {
            cy.get('#top10biomes').contains('Plants');
            cy.get('#top10biomes').contains('Human');
            cy.get('#top10biomes').contains('Human Skin');
            cy.get('#top10biomes').contains('Terrestrial Soil');
            cy.get('#top10biomes').contains('Food production');
            cy.get('#top10biomes').contains('Mammals Digestive system');
            cy.get('#top10biomes').contains('Human Digestive system');
            cy.get('#top10biomes').contains('Aquatic');
            cy.get('#top10biomes').contains('Aquatic Marine');
            cy.get('#top10biomes').contains('Wastewater');
        })

    });

    context('Perform click events', function () {
        beforeEach(function () {
            openPage(origPage);
        });

        it('Browse all biomes', function () {
            cy.contains('Browse all biomes').click();
            cy.url().should('eq', getBaseURL()+'biomes')
        });

        it('Browse human biomes', function () {
            cy.get('#top10biomes').get('.human_host_b.Human.Skin').click();
            cy.url().should('include', getBaseURL()+'studies?lineage=root:Host-associated:Human:Skin')
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
            cy.get("#studies > .study", {timeout: 5000}).should("have.length", parseInt(25));
            cy.get('#latestStudies').contains('View more').first().click();
            cy.contains('Project');
            cy.title().should('include', 'Study');
        });
    })
});