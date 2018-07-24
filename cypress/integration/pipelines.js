import {openPage} from '../util/util';

const origPage = 'pipelines';

const pipelineTitles = [
    'Pipeline v.4.1 (17-Jan-2018)',
    'Pipeline v.4.0 (04-Sep-2017)',
    'Pipeline v.3.0 (30-Jun-2016)',
    'Pipeline v.2.0 (15-Feb-2015)',
    'Pipeline v.1.0 (09-Dec-2009)'
];

describe('Pipelines page', function() {
    before(function() {
        openPage(origPage);
    });
    context('Page title', function() {
        it('Page title should be present', function() {
            cy.contains('Pipeline release archive').should('be.visible');
        });
    });
    context('Pipeline descriptions', function() {
        it('Pipeline 4.1 should be visible', function() {
            cy.contains(pipelineTitles[0]).should('be.visible');
        });
        it('Pipeline 4 should be visible', function() {
            cy.contains(pipelineTitles[1]).should('be.visible');
        });
        it('Pipeline 3 should be visible', function() {
            cy.contains(pipelineTitles[2]).should('be.visible');
        });
        it('Pipeline 2 should be visible', function() {
            cy.contains(pipelineTitles[3]).should('be.visible');
        });
        it('Pipeline 1 should be visible', function() {
            cy.contains(pipelineTitles[4]).should('be.visible');
        });
        it('Should be ordered from latest version', function() {
            cy.get('h3.pi_arch_title').each(($el, i) => {
                expect($el.text()).to.contain(pipelineTitles[i]);
            });
        });
    });
});
