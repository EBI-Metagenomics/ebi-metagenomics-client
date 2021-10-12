import {openPage, waitForPageLoad} from '../util/util';

const pubmedId = '19043404';
const origPage = 'publications/' + pubmedId;

describe('Publication page', function() {
    before(() => {
        cy.server();
        cy.intercept('GET', '**/europe_pmc_annotations',
            {fixture: 'publicationEuropePMCAnnotations.json'});
    });
    context('Page sections', function() {
        before(function() {
            openPage(origPage);
            waitForPageLoad('Publication: A core gut microbiome in obese and lean twins.');
        });

        it('Verify elements are present', function() {
            cy.get('h4').should('contain', 'Turnbaugh');
            cy.get(':nth-child(2) > .medium-8 > .ext').should('contain', '10.1038/nature07540');
            cy.get(':nth-child(3) > .medium-8 > .ext').should('contain', '19043404');
            cy.get(':nth-child(4) > .medium-8').should('contain', '2009');
        });

        it('Should be able to toggle sections', function() {
            cy.contains('Journal name').should('be.visible');
            cy.contains('External links').click();
            cy.contains('Journal name').should('not.be.visible');
            cy.contains('External links').click();
            cy.contains('Journal name').should('be.visible');

            cy.contains('Powered by').should('be.visible');
            cy.contains('Europe PMC Annotations').click();
            cy.contains('Powered by').should('not.be.visible');
            cy.contains('Europe PMC Annotations').click();
            cy.contains('Powered by').should('be.visible');

            cy.contains('Download results').should('be.visible');
            cy.contains('Associated studies').click();
            cy.contains('Download results').should('not.be.visible');
            cy.contains('Associated studies').click();
            cy.contains('Download results').should('be.visible');
        });

        it('Should have interactive annotation tree', function() {
            cy.contains('Europe PMC Annotations').scrollIntoView();
            cy.contains('Sample processing').should('be.visible');
            const annotationGroups = [
                'Sequencing platform',
                'Library strategy',
                'State',
                'Sample material',
                'Gene',
                'Body site',
                'Host'
            ];
            annotationGroups.forEach((groupTitle) => {
                cy.contains(groupTitle).should('exist');
            });

            cy.get('#annotations >> .expand-button').each(($el) => {
                cy.wrap($el).click();
                cy.wrap($el).invoke('attr', 'for').then((forId) => {
                    cy.get(`${forId}`).should('be.visible');
                });
            });

            cy.get('#annotation-group-0-0 > :nth-child(14) > .expand-button').click();
            cy.get('#annotation-0-0-6 > :nth-child(2)').should('be.visible');
            cy.get('#annotation-0-0-6 > :nth-child(3)')
                .should('be.visible')
                // eslint-disable-next-line max-len
                .should('have.attr', 'href', 'http://europepmc.org/article/PMC/PMC2677729#Metagenomics-10b0ec7b71a26c954afc364b5cea59ae');
            cy.get('#annotation-0-0-6 > a:nth-child(4)')
                .should('contain', 'Ontology definition for ‘Titanium’')
                .should('be.visible');
        });
    });
});
