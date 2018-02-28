import {openPage, datatype} from './util';
import Config from './config';
import GenericTableHandler from './genericTable';

const projectId = "ERP019566";
const origPage = "studies/" + projectId;

const samplesTableDefaultSize = 10;
const runsTableDefaultSize = 25;

const sampleTableColumns = {
    sample_name: {
        data: ['Control patient 9 right foot time 1', 'Patient 7 skin adjacent to wound time 2'],
        type: datatype.STR,
        sortable: true
    },
    accession: {
        data: ['ERS1474797', 'ERS1474709'],
        type: datatype.STR,
        sortable: true
    },
    description: {
        data: ['control_skin_right', 'diabetic_skin_adj'],
        type: datatype.STR,
        sortable: false
    },
    last_update: {
        data: ['27-Nov-2017', '27-Nov-2017'],
        type: datatype.DATE,
        sortable: true
    }
};

const runTableColumns = {
    accession: {
        data: ['ERR1760141', 'ERR1760117'],
        type: datatype.STR,
        sortable: true
    },
    experiment_type: {
        data: ['amplicon', 'amplicon'],
        type: datatype.STR,
        sortable: false
    },
    instrument_model: {
        data: ['Illumina MiSeq', 'Illumina MiSeq'],
        type: datatype.STR,
        sortable: false
    },
    instrument_platform: {
        data: ['Illumina platform', 'Illumina platform'],
        type: datatype.STR,
        sortable: false
    },
    pipeline_version: {
        data: ['4.0', '4.0'],
        type: datatype.STR,
        sortable: false
    },
};

function waitForPageLoad(projectId) {
    cy.get('h3').should('contain', projectId)
}

describe('Study page - General', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad(projectId);
    });

    it('Verify elements are present', function () {
        cy.get('h3').should('contain', projectId);
        cy.get('h2').should('contain', 'Longitudinal study of the diabetic skin and wound microbiome');
        //    TODO add more verifications
    });

    it('External links should all be valid', function () {
        cy.get('ul#links > li > a').each(($el) => {
            urlExists($el.attr('href'));
        });
    });
});

let table;
describe('Study page - Samples table', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad(projectId);
        table = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
    });

    it('Samples table should contain correct number of samples', function () {
        table.checkLoadedCorrectly(1, 10, 258, sampleTableColumns);
    });

    it('Samples table should respond to ordering', function () {
        table.testSorting(10, sampleTableColumns);
    });

    it('Samples table should respond to filtering', function () {
        table.testFiltering('ERS1474800', [['Control patient 9 left foot time 3', 'ERS1474800', 'control_skin_left', '27-Nov-2017']])
    });

    it('Samples table should respond to pagination', function () {
        table.testPagination(10, [{
            index: 1,
            data: ['Control patient 9 right foot time 1', 'ERS1474797', 'control_skin_right', '27-Nov-2017'],
        }, {
            index: 3,
            data: ['Patient 5 wound debridement time 5', 'ERS1474870', 'wound_deb', '27-Nov-2017']
        }, {
            index: 'next',
            data: ['Patient 6 skin contralateral foot to wound time 4', 'ERS1474887', 'diabetic_skin_contra', '27-Nov-2017'], // 4th row
            pageNum: 4
        }, {
            index: 'prev',
            data: ['Patient 5 wound debridement time 5', 'ERS1474870', 'wound_deb', '27-Nov-2017'], // Back to 3rd row
            pageNum: 3
        }, {
            index: 'last',
            data: ['Patient 5 skin contralateral foot to wound time 2', 'ERS1474858', 'diabetic_skin_contra', '27-Nov-2017'],
            pageNum: 6,
            pageSize: 8
        }, {
            index: 'first',
            data: ['Control patient 9 right foot time 1', 'ERS1474797', 'control_skin_right', '27-Nov-2017'],
            pageNum: 1
        }]);
    });

    it('Samples table should respond to page size change', function () {
        table.testPageSizeChange(samplesTableDefaultSize, 25)
    });

    it('Sample table download link should be valid', function () {
        table.testDownloadLink(Config.API_URL + 'samples?study_accession=' + projectId + "&format=csv")
    });
});

describe('Study page - Runs table', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad(projectId);
        table = new GenericTableHandler('#runs-section', runsTableDefaultSize);
    });

    it('Runs table should contain correct number of runs', function () {
        table.checkLoadedCorrectly(1, 25, 258);
    });

    it('Runs table should respond to ordering', function () {
        table.testSorting(25, runTableColumns);
    });

    it('Runs table should respond to filtering', function () {
        table.testFiltering('ERR1760140', [['ERR1760140', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0']])
    });


    it('Runs table should respond to pagination', function () {
        table.testPagination(25, [{
            index: 1,
            data: ['ERR1760141', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0'],
        }, {
            index: 3,
            data: ['ERR1760091', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0']
        }, {
            index: 'next',
            data: ['ERR1760066', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0'], // 4th row
            pageNum: 4
        }, {
            index: 'prev',
            data: ['ERR1760091', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0'],
            pageNum: 3
        }, {
            index: 'last',
            data: ['ERR1759891', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0'],
            pageNum: 11,
            pageSize: 8
        }, {
            index: 'first',
            data: ['ERR1760141', 'amplicon', 'Illumina MiSeq', 'ILLUMINA', '4.0'],
            pageNum: 1
        }]);
    });

    it('Runs table should respond to page size change', function () {
        table.testPageSizeChange(runsTableDefaultSize, 50)
    });

    it('Runs table download link should be valid', function () {
        table.testDownloadLink(Config.API_URL + 'runs?study_accession=' + projectId + "&format=csv")
    });
});

describe('Study page - Runs table with >1 analysis per run', function(){
    beforeEach(function () {
        const projectId = "ERP009703";
        const origPage = "studies/" + projectId;
        openPage(origPage);
        waitForPageLoad(projectId);
        table = new GenericTableHandler('#runs-section', runsTableDefaultSize);
    });
    it('Runs table should display both pipeline versions for a run', function(){
        table.testPageRowData('last', 17, 0, ['ERR770966', 'metagenomic', '', '', '2.0, 4.0']);
    });
});
