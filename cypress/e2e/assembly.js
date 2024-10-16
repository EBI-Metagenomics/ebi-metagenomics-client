import {openPage, isValidLink, datatype, waitForPageLoad} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const accession = 'ERZ477708';
const origPage = 'assemblies/' + accession;
const descriptionSection = '#overview div.row div.box';

const assemblyTableColumns = {
    analysisAccession: {
        data: ['MGYA00140023'],
        type: datatype.STR,
        sortable: false
    },
    experiment_type: {
        data: ['assembly'],
        type: datatype.STR,
        sortable: false
    },
    instrument_model: {
        data: ['Illumina MiSeq'],
        type: datatype.NUM,
        sortable: false
    },
    instrument_platform: {
        data: ['ILLUMINA'],
        type: datatype.STR,
        sortable: false
    },
    pipeline: {
        data: ['4.0'],
        type: datatype.NUM,
        sortable: true
    }
};

let assembliesTable;

describe.skip('Assembly page', function() {
    before(function() {
        cy.intercept('https://www.ebi.ac.uk/ena/portal/api/search?' +
                 'result=assembly&format=json&query=accession=GCA_900217105', [{
                'accession': 'GCA_900217105',
                'version': '1X',
                'assembly_name': 'SRR4420304',
                'description': 'SRR4420304 assembly for human gut metagenome'
        }]);
    });
    context('Elements load correctly', function() {
        before(function() {
            openPage(origPage);
        });
        it('Should display title', function() {
            cy.contains('Assembly ' + accession).should('be.visible');
        });
        it('Should display description section', function() {
            cy.contains('Description').should('be.visible');
            cy.get(descriptionSection).then(($el) => {
                const text = $el.text().replace('');
                expect(text).to.contain('Sample:\n                SRS1743794');
                expect(text).to.contain('ENA accession:\n                ' + accession);
            });
        });
        it('Table of analyses should load correctly', function() {
            assembliesTable = new GenericTableHandler('#analyses', 1);
            const rowData = Cypress._.map(assemblyTableColumns, function(a) {
                return a['data'][0];
            });
            cy.log(rowData);
            assembliesTable.checkRowData(0, rowData);
        });
    });
    context('Click actions', function() {
        before(function() {
            cy.intercept('GET',
                '**/' + accession + '/analyses**')
                .as('analyses');
            openPage(origPage);
            cy.wait('@analyses');
            waitForPageLoad('Assembly ' + accession);
        });
        it('Description section should be hideable', function() {
            cy.get(descriptionSection).should('be.visible');
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.hidden', {timeout: 400000});
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.visible');
        });
        it('Description links should be valid', function() {
            const sampleLink = cy.get(descriptionSection + ' a').eq(0);
            sampleLink.should('have.attr', 'href').then((href) => {
                cy.request(href).then((resp) => {
                    expect(resp['status']).to.equal(200);
                });
            });
            const enaLink = cy.get(descriptionSection + ' a').eq(1);
            enaLink.should('have.attr', 'href').then((href) => {
                expect(href).to.equal('https://www.ebi.ac.uk/ena/browser/view/ERZ477708');
            });
        });
        it('Analyses table links should be valid', function() {
            cy.get('table.analyses-table a').each(($el) => {
                isValidLink($el);
            });
        });
    });
    context('Error handling', function() {
        it('Should display error if run does not exist', function() {
            const runId = 'GCA_invalid';
            openPage('assemblies/' + runId);
            cy.contains('Could not retrieve assembly: ' + runId);
        });
    });
    context('Breadcrumbs', function() {
        it('Should display sample id in breadcrumbs with single sample', function() {
            openPage(origPage);
            cy.get('.breadcrumbs').contains('SRS1743794');
        });
        it('Should display non-hyperlink sample breadcrumbs if assembly contains > 1 sample',
            function() {
                cy.intercept('GET', '**/assemblies/' + accession, 'fixture:assemblyMultipleSamples');
                openPage(origPage);
                cy.contains('Multiple samples');
            });
    });
    context('External links', function() {
        it('Should generate link to ena if page exists', function() {
            openPage(origPage);
            cy.get('a[href=\'https://www.ebi.ac.uk/ena/browser/view/ERZ477708\']')
                .should('be.visible');
        });
        it('Should generate non-link text if page does not exist', function() {
            cy.intercept('GET', '**/assemblies/' + accession, 'fixture:assemblyNoEnaLink');
            openPage(origPage);
            cy.get('a[href=\'https://www.ebi.ac.uk/ena/browser/view/GCA_900217105\']')
                .should('not.exist');
        });
    });
});
