import {
    openPage,
    getBaseURL,
    waitForBiomesLoad,
    login
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';

function defaultLoginFieldsAreVisible(confidentialityText) {
    cy.get('input[name=\'analysis-type\']').should('be.visible');
    cy.get('input[name=\'reason\']').should('be.visible');
    cy.contains(confidentialityText).should('be.visible');
    cy.get('button.mailtobtn').should('be.visible');
}

describe('Home page', function() {

    context('Minimal checks', function() {
        it('has EBI header"', function() {
            openPage(origPage);
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
            openPage(origPage);
            cy.get('.ebi-header-footer .global-nav .where.ebi').contains('EMBL-EBI');
            cy.get('.ebi-header-footer .search-bar').should('be.hidden', '#global-searchbox');
            cy.get('.ebi-header-footer .search-toggle').click();
            cy.get('.ebi-header-footer .search-bar').contains('Search');
            cy.get('.ebi-header-footer .search-bar .close-button').click();
            cy.get('.ebi-header-footer .search-bar').should('be.hidden', '#global-searchbox');
        });
        it('has EBI footer"', function() {
            openPage(origPage);
            cy.get('footer.vf-footer .vf-footer__notice').contains('EMBL-EBI is');
            cy.get('footer.vf-footer').contains('Copyright');
        });

    });

    context('Cookie banner check', function() {
        it('has Cookie banner"', function() {
            cy.clearCookie('cookies-accepted');
            openPage(origPage);
            cy.get('.mg-cookie-banner .vf-banner__text').contains('This website');
            cy.get('.mg-cookie-banner .vf-button').contains('Accept');
            cy.get('.mg-cookie-banner .vf-button').click();
            cy.get('.mg-cookie-banner').should('not.exist');
        });
    });

    context('Check for elements', function() {
        it('Browse by selected biomes"', function() {
            openPage(origPage);
            cy.contains('Or by selected biomes');
            // Check biome icons are loaded
            cy.get('.search-by-biomes-section span.biome_icon').then(($els) => {
                expect($els).to.have.length(2);
            });
        });

        it('Select specific biomes', function() {
            openPage(origPage);
            cy.get('.search-by-biomes-section').contains('Human');
            cy.get('.search-by-biomes-section').contains('Digestive system');
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
    context('Latest studies', function() {
        it('Check for elements"', function() {
            openPage(origPage);
            cy.get('.request-by-section').contains('Latest studies');
        });

        it('Click to view all studies', function() {
            openPage(origPage);
            cy.contains('View all studies').click();
            // cy.contains('Studies list');
            // cy.title().should('include', 'Browse');
        });

        it('Click to view specific study', function() {
            openPage(origPage);
            cy.get('.latest-studies-section > .fixed-height-scrollable__inner > .study', {timeout: 30000}).should('have.length', parseInt(1));
            // cy.get('.latest-studies-section').contains('View more').first().click();
            // cy.contains('Study');
            // cy.title().should('include', 'Study');
        });
    });
    context('CTA section', function() {
        it('should have Search By btns', function() {
            openPage(origPage);
            cy.get('.search-by-section').should('contain', 'Text search');
            cy.get('.search-by-section').should('contain', 'Sequence search');
        });
        it('should have Requests btns', function() {
            openPage(origPage);
            cy.get('.request-by-section').should('contain', 'Submit and');
            cy.get('.request-by-section').should('contain', 'Request');
        });

        it('Text search btn should link to text search page', function() {
            openPage(origPage);
            cy.contains('Text search').click();
            cy.get('h2').should('contain', 'Text Search');
        });
        // it('Sequence search btn should link to seq search page', function() {
        //     cy.contains('Sequence search').click();
        //     cy.get('h2').should('contain', 'Sequence Search');
        // });
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
