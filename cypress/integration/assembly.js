import {openPage, isValidLink, datatype} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const accession = 'GCA_900217105';
const origPage = 'assemblies/' + accession;
const descriptionSection = '#overview div.row.box';
const assemblySection = '#assemblies div:not(\'row\')';

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

describe('Assembly page', function() {
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
                const text = $el.text();
                expect(text).to.contain('Study:\n            MGYS00002062');
                expect(text).to.contain('Sample:\n            SRS1743794');
                expect(text).to.contain('ENA accession:\n            ' + accession);
            });
        });
        it('Table of assemblies should load correctly', function() {
            assembliesTable = new GenericTableHandler('#assemblies', 1);
            const rowData = Cypress._.map(assemblyTableColumns, function(a){
                return a['data'][0];
            });
            cy.log(rowData);
            assembliesTable.checkRowData(0, rowData);
        });
        it('Analyses table should be hidden', function() {
            cy.get('#analyses').should('be.hidden');
        });
    });
    context('Click actions', function() {
        before(function() {
            openPage(origPage);
        });
        it('Description section should be hideable', function() {
            cy.get(descriptionSection).should('be.visible');
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.hidden', {timeout: 400000});
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.visible');
        });
        it('Assemblies section should be hideable', function() {
            cy.get(assemblySection).should('be.visible');
            cy.contains('Assemblies').click();
            cy.get(assemblySection).should('be.hidden', {timeout: 400000});
            cy.contains('Assemblies').click();
            cy.get(assemblySection).should('be.visible');
        });
        it('Description links should be valid', function() {
            cy.get(descriptionSection + ' a').each(($el) => {
                isValidLink($el);
            });
        });
        it('Assemblies table links should be valid', function() {
            cy.get('table.assemblies-table a').each(($el) => {
                isValidLink($el);
            });
        });
        it('Table ordering should function', function() {
            assembliesTable = new GenericTableHandler('#assemblies', 1);
            assembliesTable.testSorting(1, assemblyTableColumns);
        });
    });
    context('Error handling', function() {
        it('Should display error if run does not exist', function() {
            const runId = 'GCA_invalid';
            openPage('assemblies/' + runId);
            cy.contains('Could not retrieve assembly: ' + runId);
        });
    });
});
