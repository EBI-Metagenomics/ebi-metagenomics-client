import {openPage, isValidLink, datatype} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const accession = 'ERR770966';
const origPage = 'runs/' + accession;
const descriptionSection = '#overview div.row.box';
const analysesSection = '#analyses div:not(\'row\')';

const analysesTableColumns = {
    analysisAccession: {
        data: ['MGYA00135707', 'MGYA00004713'],
        type: datatype.STR,
        sortable: false
    },
    experiment_type: {
        data: ['metagenomic', 'metagenomic'],
        type: datatype.STR,
        sortable: false
    },
    instrument_model: {
        data: ['Illumina MiSeq', 'Illumina MiSeq'],
        type: datatype.NUM,
        sortable: false
    },
    instrument_platform: {
        data: ['ILLUMINA', 'ILLUMINA'],
        type: datatype.STR,
        sortable: false
    },
    pipeline: {
        data: ['4.0', '2.0'],
        type: datatype.NUM,
        sortable: true
    }
};

let analysesTable;

describe('Run page', function() {
    context('Elements load correctly', function() {
        before(function() {
            openPage(origPage);
        });
        it('Should display title', function() {
            cy.contains('Run ' + accession).should('be.visible');
        });
        it('Should displace description section', function() {
            cy.contains('Description').should('be.visible');
            cy.get(descriptionSection).then(($el) => {
                const text = $el.text();
                expect(text).to.contain('Study:\n            MGYS00000462');
                expect(text).to.contain('Sample:\n            ERS667576');
                expect(text).to.contain('ENA accession:\n            ' + accession);
            });
        });
        it('Table of analyses should load correctly', function() {
            analysesTable = new GenericTableHandler('#analyses', 2);
            analysesTable.checkLoadedCorrectly(1, 2, 2, analysesTableColumns);
        });
        it('Assemblies table should be hidden', function() {
            cy.get('#assemblies').should('be.hidden');
        });
    });
    context('Click actions', function() {
        before(function() {
            openPage(origPage);
        });
        it('Description section should be hideable', function() {
            cy.get(descriptionSection).should('be.visible');
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.hidden');
            cy.contains('Description').click();
            cy.get(descriptionSection).should('be.visible');
        });
        it('Analyses section should be hideable', function() {
            cy.get(analysesSection).should('be.visible');
            cy.contains('Analyses').click();
            cy.get(analysesSection).should('be.hidden');
            cy.contains('Analyses').click();
            cy.get(analysesSection).should('be.visible');
        });
        it('Description links should be valid', function() {
            cy.get(descriptionSection + ' a').each(($el) => {
                isValidLink($el);
            });
        });
        it('Analyses table links should be valid', function() {
            cy.get('table.analyses-table a').each(($el) => {
                isValidLink($el);
            });
        });
        it('Table ordering should function', function() {
            analysesTable = new GenericTableHandler('#analyses', 2);
            analysesTable.testSorting(2, analysesTableColumns);
        });
    });
    context('Error handling', function() {
        it('Should display error if run does not exist', function() {
            const runId = 'ERR_invalid';
            openPage('runs/' + runId);
            cy.contains('Could not retrieve run: ' + runId);
        });
    });
});
