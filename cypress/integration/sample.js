import {openPage, datatype, urlExists, login} from '../util/util';
import Config from '../util/config';
import GenericTableHandler from '../util/genericTable';

const sampleId = 'ERS434640';
const origPage = 'samples/' + sampleId;

const studiesTableDefaultSize = 2;

const studyTableColumn = {
    biome_icon: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    study_id: {
        data: ['MGYS00002011', 'MGYS00000369'],
        type: datatype.STR,
        sortable: false
    },
    study_name: {
        data: [
            'EMG produced TPA metagenomics assembly of the Microbial Community of ' +
            'Mobilong Acid Sulfate Soil depth profile using Metagenomics (Mobilong Soil Profile) ' +
            'data set', 'Microbial Community of Mobilong Acid Sulfate Soil depth profile ' +
            'using Metagenomics'],
        type: datatype.STR,
        sortable: false
    },
    study_desc: {
        data: [
            'The Mobilong Soil Profile Third Party Annotation (TPA)' +
            ' assembly was derived from ' +
            'the primary whole genome shotgun (WGS) data set PRJEB5872.' +
            ' This project includes samples' +
            ' from the following biomes : Grassland.',
            'The latter part of the Australian Millenium' +
            ' drought in 2007-2009 caused the acidification of acid sulfate' +
            ' soils in wetland and' +
            ' former floodplain soils, which pose threats to terrestrial and' +
            ' coastal ecosystems even' +
            ' after the recovery of surface flows and ground water levels.' +
            ' Drying and subsequent' +
            ' oxidation of ASS materials caused soil pH to drop to less than' +
            ' 4 (forming sulfuric' +
            ' materials) in some areas, triggering environmental problems such' +
            ' as land degradation,' +
            ' loss of native plants and animals, and release of heavy metals' +
            ' and metalloids into' +
            ' ground water, rivers and wetlands. ' +
            'To understand this microbially-mediated oxidation' +
            ' process, microbial communities were studied within an acidified acid sulfate soil' +
            ' profile, to identify key microorganisms involved in' +
            ' soil acidification. Six soil layers' +
            ' were sampled from a soil profile according to soil morphology at the most acidic' +
            ' locationin the field. Total DNA from soil samples' +
            ' was extracted using MO-BIO PowerMax?' +
            ' Soil DNA Isolation Kit and sequenced by Illumina Miseq (250PE) by The Ramaciotti' +
            ' Centre, NSW, Australia, prepared with a Nextera' +
            ' DNA Sample Preparation Kit. There were' +
            ' five steps of non-specific amplification involved in Nextera-Miseq sequencing for' +
            ' obtaining enough DNA for sequencing.'],
        type: datatype.STR,
        sortable: false
    },
    samples_count: {
        data: ['2', '6'],
        type: datatype.NUM,
        sortable: false
    },
    last_update: {
        data: ['15-Nov-2017', '15-Mar-2016'],
        type: datatype.DATE,
        sortable: false
    }
};

const runTableColumns = {
    accession: {
        data: ['SRR997122', 'SRR997098'],
        type: datatype.STR,
        sortable: true
    },
    experiment_type: {
        data: ['amplicon', 'amplicon'],
        type: datatype.STR,
        sortable: false
    },
    instrument_model: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    instrument_platform: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    pipeline_version: {
        data: ['2.0', '2.0'],
        type: datatype.STR,
        sortable: false
    }
};

function waitForPageLoad(projectId) {
    cy.get('h3').should('contain', projectId);
}

describe('Sample page', function() {
    context('General', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(sampleId);
        });

        it('Verify elements are present', function() {
            const colSelector = '#main-content-area > div.row > div.column';
            cy.get('h3').should('contain', sampleId);
            cy.get('h2').should('contain', 'Sample ASSDL1');
            cy.get(colSelector + ' > h3:nth-child(2)').should('contain', 'Description');
            cy.get(colSelector + ' > h3').should('contain', 'Classification');
            cy.get(colSelector + ' > p').should('contain', 'ASS depth profile');
            cy.get('#sample-metadata')
                .should('contain', 'Collection date:')
                .should('contain', '01/02/2013');
        });
        it('External links should all be valid', function() {
            cy.get('ul#links > li > a').each(($el) => {
                urlExists($el.attr('href'));
            });
        });
    });

    let table;
    context('Study table', function() {
        beforeEach(function() {
            openPage('');
            login();
            openPage(origPage);
            waitForPageLoad(sampleId);
            table = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
        });

        it('Should be toggleable', function() {
            table.testTableHiding();
        });

        it('Studies table should contain correct number of results', function() {
            // Login to view private data.
            table.checkLoadedCorrectly(1, 2, 2, studyTableColumn);
        });

        it('Studies table download link should be valid', function() {
            const url = Config.API_URL + 'samples/' + sampleId
                + '/studies?ordering=&format=csv';
            table.testDownloadLink(url);
        });
    });

    context('Runs table', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(sampleId);
            table = new GenericTableHandler('#runs-section', 2);
        });

        it('Runs table should respond to ordering', function() {
            table.testSorting(2, runTableColumns);
        });

        it('Runs table should respond to filtering', function() {
            table.testFiltering('GCA', [
                ['GCA_900215965', 'assembly', 'Illumina MiSeq', 'ILLUMINA', '4.0']
            ]);
        });

        it('Should be toggleable', function() {
            table.testTableHiding();
        });

        // Redundant due to low number of runs per sample (2 rows in single page)
        // it('Runs table should respond to pagination', function () {
        //     table.testPagination(2, [{
        //         index: 1,
        //         data: ['SRR997122', 'amplicon', '', '', '2.0'],
        //     }, {
        //         index: 3,
        //         data: ['SRR997072', 'amplicon', '', '', '2.0'],
        //     }, {
        //         index: 'Next',
        //         data: ['SRR997047', 'amplicon', '', '', '2.0'],
        //         pageNum: 4
        //     }, {
        //         index: 'Previous',
        //         data: ['SRR997072', 'amplicon', '', '', '2.0'],
        //         pageNum: 3
        //     }, {
        //         index: 'Last',
        //         data: ['ERR010497', 'metatranscriptomic', '', '', '1.0'],
        //         pageNum: 506,
        //         pageSize: 18
        //     }, {
        //         index: 'First',
        //         data: ['SRR997122', 'amplicon', '', '', '2.0'],
        //         pageNum: 1
        //     }]);
        // });

        // it('Runs table should respond to page size change', function () {
        // TODO use sample with > 25 runs to test
        //     table.testPageSizeChange(runsTableDefaultSize, 50)
        // });

        it('Runs table download link should be valid', function() {
            table.testDownloadLink(
                Config.API_URL + 'runs?ordering=accession&sample_accession=' + sampleId +
                '&format=csv'
            );
        });
    });

    context('Runs table with >1 analysis per run', function() {
        beforeEach(function() {
            const projectId = 'ERS853149';
            const origPage = 'samples/' + projectId;
            openPage(origPage);
            waitForPageLoad(projectId);
            table = new GenericTableHandler('#runs-section', 1);
        });

        it('Runs table should display both pipeline versions for a run', function() {
            table.checkRowData(0, ['ERR1022502', 'metatranscriptomic', '', '', '2.0, 4.0']);
        });
    });

    context('Metadata display', function() {
        it('Info message should be displayed if no metadata available for display', function() {
            const projectId = 'ERS1474797';
            const origPage = 'samples/' + projectId;
            openPage(origPage);
            waitForPageLoad(projectId);
            table = new GenericTableHandler('#runs-section', 1);
            cy.get('#sample-metadata').contains('No metadata to be displayed.');
        });

        it('Should dispaly metadata fields correctly', function() {
            const projectId = 'ERS949427';
            const origPage = 'samples/' + projectId;
            openPage(origPage);
            waitForPageLoad(projectId);
            cy.get('#sample-metadata').then(($el) => {
                const text = Cypress.$($el).text();
                expect(text).to.contain('Collection date:\n            2014-11-17');
                expect(text)
                    .to
                    .contain('ENA checklist:\n            GSC MIxS plant associated (ERC000020)');
                expect(text)
                    .to
                    .contain('Geographic location (region and locality):\n            Cologne');
                expect(text).to.contain('Host common name:\n            Thale cress');
                expect(text).to.contain('Host taxid:\n            3702');
                expect(text).to.contain('Instrument model:\n            Illumina MiSeq');
                expect(text).to.contain('Investigation type:\n            metagenome');
                expect(text).to.contain('NCBI sample classification:\n            1297885');
                expect(text).to.contain('Plant product:\n            clay');
                expect(text)
                    .to
                    .contain(
                        'Plant-associated environmental package:\n            plant-associated');
                expect(text)
                    .to
                    .contain(
                        'Project name:\n            ena-STUDY-MPIPZ-29-10-2015-07:38:39:510-31');
                expect(text).to.contain('Sequencing method:\n            MiSeq');
            });
        });
    });

    context('Error handling', function() {
        it('Should display error message if invalid accession passed in URL', function() {
            const sampleId = 'ERS14747971323123';
            const origPage = 'samples/' + sampleId;
            openPage(origPage);
            cy.get('h2').should('contain', 'Oh no! An error has occured!');
            cy.contains('Error: 404');
            cy.contains('Could not retrieve sample: ' + sampleId);
        });
    });
});
