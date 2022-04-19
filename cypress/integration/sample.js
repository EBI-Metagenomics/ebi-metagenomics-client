import { openPage, datatype, login, changeTab } from '../util/util';
import Config from '../util/config';
import GenericTableHandler from '../util/genericTable';

const sampleId = 'ERS434640'; // accession with multiple associated studies
const origPage = 'samples/' + sampleId;

const studyIdAnalysis = 'SRS429585'; // accession with multiple analyses / assemblies

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
            ' coastal ecosystems even'],
        type: datatype.STR,
        sortable: false
    },
    samples_count: {
        data: ['2', '6'],
        type: datatype.NUM,
        sortable: false
    },
    last_update: {
        data: ['15/11/2017', '15/03/2016'],
        type: datatype.DATE,
        sortable: false
    }
};

const runTableColumns = {
    accession: {
        data: ['SRR873610', 'SRR873464'],
        type: datatype.STR,
        sortable: true
    },
    experiment_type: {
        data: ['metagenomic', 'metatranscriptomic'],
        type: datatype.STR,
        sortable: false
    },
    instrument_model: {
        data: ['Illumina MiSeq 2000', 'Illumina MiSeq 2000'],
        type: datatype.STR,
        sortable: false
    },
    instrument_platform: {
        data: ['ILLUMINA', 'ILLUMINA'],
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
    cy.get('h2').should('contain', projectId);
}

describe('Sample page', function() {
    beforeEach(function() {
        openPage(origPage);
        // TODO: an integration test using samples from local API
        // cy.intercept('GET', '**/v1/samples?**', { fixture: 'sample/samplesList.json' })
        // cy.intercept('GET', `**/v1/samples/${sampleId}`, { fixture: 'sample/sampleDetail.json' })
        cy.intercept('GET', '**/v1/**/contextual_data_clearing_house_metadata', { fixture: 'sample/contextualDataClearingHouseSampleMetadata.json' })
        cy.intercept('GET', '**/v1/**/studies_publications_annotations_existence', { fixture: 'sample/epmcStudiesPublicationsAnnotationsExistence.json' })

        // cy.get(`.mg-main-menu`).contains('Browse data').click();
        // cy.get(`.mg-search-tabs`).contains('Samples').click();
        // cy.get(`.mg-table`).contains(sampleId).click();
    });

    context('General', function() {
        it('Verify elements are present', function() {
            cy.get('h2').should('contain', sampleId);
            cy.get('h3').should('contain', 'Sample ASSDL1');
            
            const descOverview = '[data-cy=sample-description]';
            cy.get(descOverview).should('contain', 'Description');
            cy.get(descOverview).should('contain', 'ASS depth profile');

            cy.get('[data-cy=sample-metadata]')
                .should('contain', 'collection date:')
                .should('contain', '01/02/2013');
        });

        it('External links should all be valid', function() {
            cy.get('[data-cy=sample-external-links] > li > a').each(($el) => {
                const href = $el.attr('href');
                if (href.includes('ena/browser')) {
                    expect(href).to.equal('https://www.ebi.ac.uk/ena/browser/view/ERS434640');
                } else {
                    cy.request(href);
                }
            });
        });
    });

    //TODO: enable table test

    let table;
    context('Study table', function() {
        beforeEach(function() {
            // openPage('');
            // openPage(origPage);
            waitForPageLoad(sampleId);
            changeTab('studies');
            table = new GenericTableHandler('[data-cy="associated-studies"]', studiesTableDefaultSize);
        });

        it('Studies table should contain correct number of results', function() {
            table.checkLoadedCorrectly(1, 2, 2, studyTableColumn, false);
        });

        it('Studies table download link should be valid', function() {
            const url = Config.API_URL + 'samples/' + sampleId
                + '/studies?ordering=&format=csv';
            table.testDownloadLink(url);
        });
    });

    context('Runs table', function() {
        beforeEach(function() {
            openPage('samples/' + studyIdAnalysis);
            changeTab('runs')
            waitForPageLoad(studyIdAnalysis);
            table = new GenericTableHandler('.mg-runs-table', 10);
        });

        it('Runs table should respond to ordering', function() {
            table.testSorting(10, runTableColumns);
        });
    //
    //     it('Runs table should respond to filtering', function() {
    //         table.testFiltering('SRR1138702', [
    //             ['SRR1138702', 'metatranscriptomic', 'Illumina HiSeq 2000', 'ILLUMINA', '2.0']
    //         ]);
    //     });
    //
    //     it('Should be toggleable', function() {
    //         table.testTableHiding();
    //     });
    //
    //     it('Runs table download link should be valid', function() {
    //         table.testDownloadLink(
    //             Config.API_URL + 'runs?ordering=accession&sample_accession=' + studyIdAnalysis +
    //             '&format=csv'
    //         );
    //     });
    });
    //
    // context('Runs table with >1 analysis per run', function() {
    //     beforeEach(function() {
    //         const sampleID = 'ERS853149';
    //         const origPage = 'samples/' + sampleID;
    //         openPage(origPage);
    //         waitForPageLoad(sampleID);
    //         table = new GenericTableHandler('#runs-section', 1);
    //     });
    //
    //     it('Runs table should display both pipeline versions for a run', function() {
    //         table.checkRowData(0, ['ERR1022502', 'metatranscriptomic', '', '', '2.0, 4.0']);
    //     });
    // });
    //
    // const assembliesTableColumns = {
    //     accession: {
    //         data: ['ERZ477903', 'ERZ477905'],
    //         type: datatype.STR,
    //         sortable: true
    //     },
    //     experiment_type: {
    //         data: ['assembly', 'assembly'],
    //         type: datatype.STR,
    //         sortable: false
    //     },
    //     wgs_id: {
    //         data: ['ODAJ01', 'ODAI01'],
    //         type: datatype.STR,
    //         sortable: false
    //     },
    //     legacy_id: {
    //         data: ['GCA_900230525', 'GCA_900230525'],
    //         type: datatype.STR,
    //         sortable: false
    //     },
    //     pipeline_versions: {
    //         data: ['4.0', '4.0'],
    //         type: datatype.STR,
    //         sortable: false
    //     }
    // };
    //
    // context('Assemblies table', function() {
    //     const sampleId = 'SRS429585';
    //     beforeEach(function() {
    //         openPage('samples/' + sampleId);
    //         waitForPageLoad(sampleId);
    //         table = new GenericTableHandler('#assemblies-section', 3);
    //     });
    //
    //     it('Assemblies table should respond to ordering', function() {
    //         table.testSorting(3, assembliesTableColumns);
    //     });
    //
    //     it('Assemblies table should respond to filtering', function() {
    //         table.testFiltering('ERZ477905', [
    //             ['ERZ477905', 'assembly', 'ODAI01', 'GCA_900230535', '4.0']
    //         ]);
    //     });
    //
    //     it('Should be toggleable', function() {
    //         table.testTableHiding();
    //     });
    //
    //     it('Assemblies table download link should be valid', function() {
    //         table.testDownloadLink(
    //             Config.API_URL + 'assemblies?ordering=accession&sample_accession=' + sampleId +
    //             '&format=csv'
    //         );
    //     });
    // });
    //
    context('Metadata display', function() {
        it('Info message should be displayed if no metadata available for display', function() {
            const projectId = 'ERS1474797';
            const origPage = 'samples/' + projectId;
            openPage(origPage);
            waitForPageLoad(projectId);
            cy.get('#tab-default').contains('No metadata to be displayed.');
        });

        it('Should display metadata fields correctly', function() {
            const projectId = 'ERS949427';
            const origPage = 'samples/' + projectId;
            openPage(origPage);
            waitForPageLoad(projectId);
            cy.get('[data-cy=sample-metadata]').then(($el) => {
                const text = Cypress.$($el).text();
                expect(text).to.contain('collection date:2014');
                expect(text)
                    .to
                    .contain('ENA checklist:GSC MIxS plant associated (ERC000020)');
                expect(text)
                    .to
                    .contain('geographic location (region and locality):Cologne');
                expect(text).to.contain('host common name:Thale cress');
                expect(text).to.contain('host taxid:3702');
                expect(text).to.contain('instrument model:Illumina MiSeq');
                expect(text).to.contain('investigation type:metagenome');
                expect(text).to.contain('NCBI sample classification:1297885');
                expect(text).to.contain('plant product:clay');
                expect(text)
                    .to
                    .contain(
                        'plant-associated environmental package:plant-associated');
                expect(text)
                    .to
                    .contain(
                        'project name:ena-STUDY-MPIPZ-29-10-2015-07:38:39:510-31');
                expect(text).to.contain('sequencing method:MiSeq');
            });
        });
    });

    context('Contextual Data Clearing House Metadata', function() {
        it('Should display Contextual Data Clearing House Metadata', function() {
            cy.get('#cdch-sample-metadata').then(($el) => {
                const text = Cypress.$($el).text();
                expect(text).to.contain('Additional metadata for this sample')
                const listToggle = cy.get('#cdch-sample-metadata > div > details > summary');
                listToggle.click();
                const listText = Cypress.$($el).text();
                expect(listText).to.contain('BMI');
                expect(listText).to.contain('Updated');
                expect(listText).to.contain('2019');
                expect(listText).to.contain('author statement');
            });
        })
    })

    // context('Error handling', function() {
    //     it('Should display error message if invalid accession passed in URL', function() {
    //         const sampleId = 'ERS14747971323123';
    //         const origPage = 'samples/' + sampleId;
    //         openPage(origPage);
    //         cy.get('h3').should('contain', 'Error Fetching Data');
    //         cy.contains('Status: 404');
    //         cy.contains('The response from the server was not OK');
    //     });
    // });
});
