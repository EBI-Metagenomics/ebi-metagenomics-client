import {openPage, datatype, waitForPageLoad, changeTab} from '../util/util';
import Config from '../util/config';
import GenericTableHandler from '../util/genericTable';

const projectId = 'MGYS00002072';
const origPage = 'studies/' + projectId;

const pageTitle = 'Longitudinal study of the diabetic skin and wound microbiome';

const analysesTableDefaultSize = 25;

const analysisTableColumns = {
    biome: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    accession: {
        data: ['ERS1474776', 'ERS1474795'],
        type: datatype.STR,
        sortable: false
    },
    sample_name: {
        data: ['control_skin_right', 'control_skin_right'],
        type: datatype.STR,
        sortable: false
    },
    run_accession: {
        data: ['ERR1760023', 'ERR1760042'],
        type: datatype.STR,
        sortable: false
    },
    pipeline_version: {
        data: ['4.0', '4.0'],
        type: datatype.NUM,
        sortable: false
    },
    analysis_accession: {
        data: ['MGYA00140358', 'MGYA00140550'],
        type: datatype.STR,
        sortable: false
    }
};

let table;

describe('Study page', function() {
    context('General', function() {
        before(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            cy.contains('Longitudinal study of the diabetic skin and wound microbiome')
                .should('be.visible');
        });

        it('Verify elements are present', function() {
            cy.get('h3').should('contain', 'MGYS00002072');
            cy.get('h2')
                .should('contain', 'Longitudinal study of the diabetic skin and wound microbiome');
            cy.get('#ebi_ena_links').should('contain', 'ENA website (ERP019566)');
            cy.contains('Human > Skin').should('exist');
            cy.contains('Publications').scrollIntoView();
            cy.contains('A longitudinal study of the diabetic skin and wound microbiome.');
            cy.contains('Gardiner M, Vicaretti M, Sparks J, Bansal S, Bush S, et al.')
                .should('be.visible');
            cy.get('#europe_pmc_links > li').should('contain', '2017 5');
            cy.get('#europe_pmc_links > li > a').should('contain', '28740749');
            cy.get('#europe_pmc_links > li > a').should('contain', '10.7717/peerj.3543');
        });

        it('External links should all be valid', function() {
            cy.get('#ebi_ena_links > li > a').each(($el) => {
                const expected = 'https://www.ebi.ac.uk/ena/browser/view/ERP019566';
                expect($el.attr('href')).to.equal(expected);
            });
            cy.get('#europe_pmc_links > li > a').each(($el) => {
                cy.request($el.attr('href'));
            });
        });
    });

    context('Related studies', function() {
        const relatedStudiesList = '[data-cy=\'relatedStudies\']';
        it('Should display related study section', function() {
            openPage('studies/MGYS00002011');
            waitForPageLoad('EMG produced TPA metagenomics assembly of the Microbial ' +
                'Community of Mobilong Acid Sulfate Soil depth profile using Metagenomics ' +
                '(Mobilong Soil Profile) data set');
            cy.contains('Related studies');
            cy.get(relatedStudiesList).should('have.length', 1);
            cy.get(relatedStudiesList + ' a').contains('MGYS00000369').click();
            waitForPageLoad('Microbial Community of Mobilong Acid Sulfate Soil ' +
                'depth profile using Metagenomics');
        });
        it('Should not display related study section if no related studies available', function() {
            openPage('studies/MGYS00001962');
            cy.get(relatedStudiesList).should('not.exist');
        });
    });

    context('Hiding Publications display -', function() {
        const pubsList = '[data-cy=\'publications\']';
        it('Should not display empty section if no publications available', function() {
            openPage('studies/MGYS00002062');
            waitForPageLoad('EMG produced TPA metagenomics assembly of the Identification' +
                ' of fungi and ameba from human wound genomic sequencing (human wound) data set');
            cy.get(pubsList + ' li').should('have.length', 1).contains('No known publications.');
        });
    });

    context('Analysis table', function() {
        before(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            table = new GenericTableHandler('#analysis-section', analysesTableDefaultSize);
        });

        it('Should be toggleable', function() {
            table.testTableHiding();
        });

        it('Should contain correct number of analyses', function() {
            table.checkLoadedCorrectly(1, analysesTableDefaultSize, 258, analysisTableColumns);
        });

        it('Should respond to ordering', function() {
            table.testSorting(10, analysisTableColumns);
        });

        // Filtering of analyses no longer enabled
        // it('Should respond to filtering', function() {
        //     table.testFiltering('ERS1474800', [
        //         [
        //             '',
        //             'ERS1474800',
        //             'Control patient 9 left foot time 3',
        //             'control_skin_left',
        //             '27-Nov-2017']]);
        // });

        it('Should respond to pagination', function() {
            table.testPagination(25, [
                {
                    index: 1,
                    data: [
                        '',
                        'ERS1474776', 'control_skin_right', 'ERR1760023', '4.0', 'MGYA00140358']
                }, {
                    index: 3,
                    data: [
                        '',
                        'ERS1474717', 'diabetic_skin_contra', 'ERR1759967', '4.0', 'MGYA00140503']
                }, {
                    index: 'Next', // 4th page
                    data: [
                        '', 'ERS1474560', 'control_skin_left', 'ERR1759912', '4.0', 'MGYA00140428'],
                    pageNum: 4
                }, {
                    index: 'Previous',
                    data: [
                        '',
                        'ERS1474717', 'diabetic_skin_contra', 'ERR1759967', '4.0', 'MGYA00140503'],
                    pageNum: 3
                }, {
                    index: 'Last',
                    data: [
                        '',
                        'ERS1474833', 'diabetic_skin_adj', 'ERR1760080', '4.0', 'MGYA00140603'],
                    pageNum: 11,
                    pageSize: 8
                }, {
                    index: 'First',
                    data: [
                        '',
                        'ERS1474776', 'control_skin_right', 'ERR1760023', '4.0', 'MGYA00140358'],
                    pageNum: 1
                }]);
        });

        it('Should respond to page size change', function() {
            table.testPageSizeChange(analysesTableDefaultSize, 25);
        });

        it('Analysis table download link should be valid', function() {
            table.testDownloadLink(Config.API_URL + 'studies/' + projectId +
                '/analyses?include=sample&format=csv');
        });
    });

    context('Error handling', function() {
        it('Should display error message if invalid accession passed in URL', function() {
            const studyId = 'ERP019566012345';
            const origPage = 'studies/' + studyId;
            openPage(origPage);
            waitForPageLoad('Oh no! An error has occurred!');
            cy.contains('Error: 404');
            cy.contains('Could not retrieve study: ' + studyId);
        });
    });

    context('Downloads tab', function() {
        beforeEach(function() {
            const projectId = 'MGYS00000462';
            const origPage = 'studies/' + projectId;
            openPage(origPage);
            changeTab('analysis');
        });
        it('Download links for both pipeline versions should be present', function() {
            const pipelineVersions = ['2.0', '4.0'];
            let i = 0;
            cy.get('#downloads h3').each(function($el) {
                expect(Cypress.$($el).text()).to.eq('Pipeline version: ' + pipelineVersions[i++]);
            });
        });
        it('Download links should contain all files for each pipeline version', function() {
            const pipeline2Files = [
                'Phylum level taxonomies',
                'Predicted tRNAs',
                'GO slim annotation',
                'Taxonomic diversity metrics',
                'Taxonomic diversity metrics SSU'];
            const pipeline4Files = [
                'Phylum level taxonomies',
                'Predicted tRNAs',
                'GO slim annotation',
                'Taxonomic assignments SSU',
                'PCA for runs (based on phylum proportions)',
                'Taxonomic assignments LSU',
                'Taxa abundance distribution',
                'Phylum level taxonomies LSU',
                'Phylum level taxonomies SSU'];
            const files = pipeline2Files.concat(pipeline4Files);
            const ps = cy.get('#downloads > div > p');
            ps.should('have.length.of', files.length - 1)
            ps.each(function($el) {
                expect(files).to.have.string(Cypress.$($el).text());
            });
        });
        // TODO test before release
        // it('Download links should all be valid', function(){
        //     cy.get('#downloads > div > p > a').each(function($el){
        //         cy.request(Cypress.$($el).attr('href'));
        //         cy.log(Cypress.$($el).attr('href'))
        //     });
        // });
    });
});
