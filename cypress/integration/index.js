import {
    openPage,
    getBaseURL,
    waitForBiomesLoad,
    waitForSearchResults,
    setupDefaultSearchPageRouting,
    login
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';
const options = {timeout: 40000};

function waitForStatsLoadingGif() {
    cy.get('.loading-gif-large').should('be.hidden', {timeout: 20000});
}

function defaultLoginFieldsAreVisible(confidentialityText) {
    cy.get('input[name=\'analysis-type\']').should('be.visible');
    cy.get('input[name=\'reason\']').should('be.visible');
    cy.contains(confidentialityText).should('be.visible');
    cy.get('button.mailtobtn').should('be.visible');
}

describe('Home page', function() {

    context('Minimal checks', function() {
        before(function() {
            openPage(origPage);
        });

        it('has EBI header"', function() {
            cy.get('.ebi-header-footer .global-nav .where.ebi').contains('EMBL-EBI');
            cy.get('.ebi-header-footer .embl-bar').should('be.hidden', 'Six sites');
            cy.get('.ebi-header-footer .global-nav #embl-selector button').click();
            cy.get('.ebi-header-footer .embl-bar').contains('Six sites');
            cy.get('.ebi-header-footer .global-nav #embl-selector button').click();
            cy.get('.ebi-header-footer .embl-bar').should('be.hidden', 'Six sites');
            cy.get('.ebi-header-footer .global-nav #embl-selector button').click();
            cy.get('.ebi-header-footer .embl-bar').contains('Six sites');
            cy.get('.ebi-header-footer .embl-bar .close-button').click();
            cy.get('.ebi-header-footer .embl-bar').should('be.hidden', 'Six sites');
        });
        it('has EBI header search"', function() {
            cy.get('.ebi-header-footer .global-nav .where.ebi').contains('EMBL-EBI');
            cy.get('.ebi-header-footer .search-bar').should('be.hidden', '#global-searchbox');
            cy.get('.ebi-header-footer .search-toggle').click();
            cy.get('.ebi-header-footer .search-bar').contains('Search');
            cy.get('.ebi-header-footer .search-bar .close-button').click();
            cy.get('.ebi-header-footer .search-bar').should('be.hidden', '#global-searchbox');
        });
        it('has EBI footer"', function() {
            cy.get('footer.vf-footer .vf-footer__notice').contains('EMBL-EBI is');
            cy.get('footer.vf-footer').contains('Copyright');
        });
        it('has Cookie banner"', function() {
            cy.get('div.vf-banner .vf-banner__text').contains('This website');
            cy.get('div.vf-banner .vf-button').contains('Accept');
            cy.get('div.vf-banner .vf-button').click();
            cy.get('div.vf-banner').should('not.exist');
        });
    });
    context.skip('Check for elements', function() {
        before(function() {
            openPage(origPage);
        });
        it('Browse by selected biomes"', function() {
            cy.contains('Or by selected biomes');
            // Check biome icons are loaded
            cy.get('#top10biomes span.biome_icon').then(($els) => {
                expect($els).to.have.length(10);
            });
        });

        it('Select specific biomes', function() {
            cy.get('#top10biomes').contains('Plants');
            cy.get('#top10biomes').contains('Human');
            cy.get('#top10biomes').contains('Skin');
            cy.get('#top10biomes').contains('Soil');
            cy.get('#top10biomes').contains('Food production');
            cy.get('#top10biomes').contains('Digestive system');
            cy.get('#top10biomes').contains('Digestive system');
            cy.get('#top10biomes').contains('Aquatic');
            cy.get('#top10biomes').contains('Marine');
            cy.get('#top10biomes').contains('Wastewater');
        });
    });

    context.skip('Perform click events', function() {
        before(function() {
            openPage(origPage);
            cy.server();
        });
        beforeEach(function() {
            cy.server();
        });
        afterEach(function() {
            cy.go('back');
        });

        it('Browse all biomes', function() {
            cy.contains('Browse all biomes').click();
            waitForBiomesLoad(25);
            cy.url().should('eq', getBaseURL() + 'biomes');
        });

        it('Browse human skin biomes', function() {
            cy.get('#top10biomes').get('.skin_b.Skin').click();
            new GenericTableHandler('#studies-section', 9);
            cy.url().should('include',
                getBaseURL() + 'browse?lineage=root:Host-associated:Human:Skin#studies');
        });
    });
    context.skip('Latest studies', function() {
        beforeEach(function() {
            openPage(origPage);
        });

        it('Check for elements"', function() {
            cy.get('#latestStudies').contains('Latest studies');
        });

        it('Click to view all studies', function() {
            cy.contains('View all studies').click();
            cy.contains('Studies list');
            cy.title().should('include', 'Browse');
        });

        it('Click to view specific study', function() {
            cy.get('#studies > .study', {timeout: 5000}).should('have.length', parseInt(25));
            cy.get('#latestStudies').contains('View more').first().click();
            cy.contains('Study');
            cy.title().should('include', 'Study');
        });
    });
    context('Getting started section', function() {
        beforeEach(function() {
            openPage(origPage);
        });
        it('should have Search By btns', function() {
            cy.get('.search-by-section').should('contain', 'Text search');
            cy.get('.search-by-section').should('contain', 'Sequence search');
        });
        it('should have Requests btns', function() {
            cy.get('.request-by-section').should('contain', 'Submit and');
            cy.get('.request-by-section').should('contain', 'Request');
        });

        it('Text search btn should link to text search page', function() {
            cy.contains('Text search').click();
            cy.get('h2').should('contain', 'Text Search');
        });
        it('Sequence search btn should link to seq search page', function() {
            cy.contains('Sequence search').click();
            cy.get('h2').should('contain', 'Sequence Search');
            // cy.get('[data-cy=\'seq-search-getting-started-btn\']').then(($el) => {
            //     expect(Cypress.$($el).attr('href')).to.contain('sequence-search');
            // });
        });
    });

    function testAnalysisTypeTooltip(tooltipDataAttr) {
        cy.get('[data-cy=\'' + tooltipDataAttr + '\']:visible')
            .invoke('hover').invoke('mouseover').trigger('mouseover').trigger('hover')
            .then(($el) => {
                const tooltipId = Cypress.$($el).parent().attr('data-toggle');
                cy.get('#' + tooltipId).should('be.visible');
            });
    }

    context.skip('Request analysis section - Private data', function() {
        const confidentialityText = 'The analysis of your data will be held confidentially ' +
            'on our site until the hold date expires.';

        before(function() {
            openPage(origPage);
            login();
            openPage(origPage);
            cy.contains('Submit and/or Request').click();
        });
        it('Form elements should be hidden until a radio button is checked', function() {
            cy.get('input[name=\'study-accession\']').should('be.hidden');
            cy.get('input[name=\'analysis-type\']').should('be.hidden');
            cy.get('input[name=\'reason\']').should('be.hidden');
            cy.contains(confidentialityText).should('be.hidden');
            cy.get('button.mailtobtn').should('be.hidden');
        });

        it('Checking yes radio box should display elements', function() {
            cy.get('input[value=\'yes\']').click();
            cy.get('input[name=\'study-accession\']').should('be.visible');
            defaultLoginFieldsAreVisible(confidentialityText);
        });
        it('Checking no radio button should display elements', function() {
            cy.get('input[value=\'no\']').click();
            cy.get('input[name=\'study-accession\']').should('be.hidden');
            cy.contains('Please submit your data before requesting analysis as it must be archived in the ENA for us to process it.').should('be.visible');
            cy.contains('Go to ENA submission page').then(($el) => {
                cy.request($el.attr('href'));
            });
        });
        it('Analysis type tooltip hover should display tooltip', function() {
            cy.get('input[value=\'yes\']').click();
            testAnalysisTypeTooltip('private-help-tooltip');
        });
    });
    context.skip('Request analysis - public data', function() {
        before(function() {
            openPage(origPage);
            login();
            openPage(origPage);
            cy.get('button[data-target-modal=\'#requestPublicAnalysisModal\']').click();
        });
        it('Analysis type tooltip hover should display tooltip', function() {
            testAnalysisTypeTooltip('public-help-tooltip');
        });
        it('Form elements should be visible', function() {
            cy.get('input[name=\'study-accession\']').should('be.visible');
            cy.get('input[name=\'analysis-type\']').should('be.visible');
            cy.get('input[name=\'reason\']').should('be.visible');
            cy.get('button.mailtobtn').should('be.visible');
        });
    });
    context.skip('Analyses request - Should force login prior to displaying forms', function() {
        beforeEach(function() {
            openPage(origPage);
        });
        it('Should display login form on public request btn click', function() {
            cy.get('button[data-target-modal=\'#requestPublicAnalysisModal\']').click();
            cy.get('#requestPublicAnalysisModal').should('be.hidden');
            cy.get('#loginModal').should('be.visible');
        });
        it('Should display login form on private request btn click', function() {
            cy.get('button[data-target-modal=\'#requestPrivateAnalysisModal\']').click();
            cy.get('#requestPrivateAnalysisModal').should('be.hidden');
            cy.get('#loginModal').should('be.visible');
        });
    });
});
