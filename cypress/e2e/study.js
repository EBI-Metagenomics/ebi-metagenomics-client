import { changeRouteTab, openPage, waitForPageLoad } from '../util/util.js';
import config from 'utils/config';
import { mockShowSaveFilePicker } from '../util/mockFileSystem';
import { first, last } from 'lodash-es';

const projectId = 'MGYS00000001';
const origPage = 'studies/' + projectId;

const pageTitle = 'Study MGYS00000001';


describe('Study page', function() {
    beforeEach(function() {
        cy.intercept('GET', `${config.api_v2}/studies/${projectId}`,
          {fixture: 'apiv2/studies/studyMGYS00000001.json'});
        cy.intercept('GET', `${config.api_v2}/studies/${projectId}/analyses/?page=1`,
          {fixture: 'apiv2/studies/studyMGYS00000001AnalysesPage1.json'}).as('getAnalysesPage1');
        cy.intercept('GET', `${config.api_v2}/studies/${projectId}/analyses/?page=2`,
          {fixture: 'apiv2/studies/studyMGYS00000001AnalysesPage2.json'}).as('getAnalysesPage2');
        cy.intercept('GET', `${config.api_v2}/studies/${projectId}/publications**`,
          {fixture: 'apiv2/studies/studyMGYS00000001Publications.json'}).as('getPublications');
        cy.intercept('GET', `${config.api_v2}/publications/1/annotations`,
          {fixture: 'apiv2/publications/publication1Annotations.json'});
    })
    context('General', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            cy.contains('Project 1')
                .should('be.visible');
        });

        it('Verify elements are present', function() {
            cy.get('h3').should('contain', 'Project 1');
            cy.get('h2')
                .should('contain', 'Study MGYS00000001');
            cy.get('[data-cy=study-external-links]').should('contain', 'ENA website (PRJNA398089)');
            cy.contains('Host-associated:Plants').should('exist');
            cy.contains('Microbiome sampling of a tomato skin.').should('exist');
            cy.contains('Publications').scrollIntoView();
            cy.contains("Cambridge University Press").should('be.visible');
        });

        it('External links should all be valid', function() {
            cy.get('[data-cy=study-external-links] > li > a').each(($el) => {
                const expected = 'https://www.ebi.ac.uk/ena/browser/view/PRJNA398089';
                expect($el.attr('href')).to.equal(expected);
            });
            cy.get('[data-cy=study-external-links] > li > a').each(($el) => {
                cy.request($el.attr('href'));
            });
        });
    });

    context.skip('Related studies', function() {
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

    context.skip('Hiding Publications display -', function() {
        const pubsList = '[data-cy=\'publications\']';
        it('Should not display empty section if no publications available', function() {
            openPage('studies/MGYS00002062');
            waitForPageLoad('EMG produced TPA metagenomics assembly of the Identification' +
                ' of fungi and ameba from human wound genomic sequencing (human wound) data set');
            cy.get(pubsList + ' li').should('have.length', 1).contains('No known publications.');
        });
    });

    context('Analysis table', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            cy.contains('Project 1')
              .should('be.visible');
        });

        it('Should contain correct number of analyses', function() {
            cy.get('span.mg-number').should('contain', '11');
        });

        // TODO ordering

        it('Should respond to pagination', function() {
            cy.contains('MGYA00000001').should('be.visible');
            cy.contains('MGYA00000010').should('be.visible');
            // noinspection CYUnresolvedAlias
            cy.get('@getAnalysesPage1.all').should('have.length', 2);
            // noinspection CYUnresolvedAlias
            cy.get('@getAnalysesPage2.all').should('have.length', 0);
            cy.get('.vf-pagination__item--next-page > .vf-button').click();
            // noinspection CYUnresolvedAlias
            cy.get('@getAnalysesPage2.all').should('have.length', 1);
            cy.contains('MGYA00000011').should('be.visible');
        });

        it('Analysis table download should paginate', function() {
            const writtenChunks = [];
            openPage(origPage, {
                onBeforeLoad(win) {
                  mockShowSaveFilePicker(win, "analyses.tsv", {content: writtenChunks});
                },
            });
            cy.get('[data-cy="emg-table-download-button"]').click();
            cy.contains("Downloaded 10 rows of 11").should('be.visible');
            cy.contains("Downloaded 11 rows of 11").should('be.visible');
            cy.contains("Downloaded table to analyses.tsv").should('be.visible');

            cy.wrap(null).then(() => {
              expect(writtenChunks[0]).to.include('experiment_type');  // has the header line
              expect(writtenChunks.join('\n')).to.include('MGYA00000001');  // has the first page
              expect(writtenChunks.join('\n')).to.include('MGYA00000011');  // has the second page
            });
        });

      it('Analysis table download should handle empty analyses list', function() {
        // TODO: probably better a unit test rather than e2e here
        cy.intercept('GET', `${config.api_v2}/studies/${projectId}/analyses/?page=1`,
          {fixture: 'apiv2/emptyList.json'}).as('getAnalysesPage1');

        const writtenChunks = [];
        openPage(origPage, {
          onBeforeLoad(win) {
            mockShowSaveFilePicker(win, "analyses.tsv", {content: writtenChunks});
          },
        });
        cy.get('[data-cy="emg-table-download-button"]').click();
        cy.contains("No data to download").should('be.visible');

        cy.wrap(null).then(() => {
          expect(writtenChunks.length).to.equal(0);
        });
      });

      it('Analysis table download should throttle as requested by API', function() {
        // TODO: probably better a unit test rather than e2e here
        let page2CallCount = 0;
        let callTimestamps = [];

        cy.fixture('apiv2/studies/studyMGYS00000001AnalysesPage2.json').then((fixtureData) => {
          cy.intercept('GET', `${config.api_v2}/studies/${projectId}/analyses/?page=2`, (req) => {
            page2CallCount ++;
            const now = Date.now();
            callTimestamps.push(now);

            if (page2CallCount < 3) {
              // throttled twice
              req.reply({
                statusCode: 429,
                body: 'Rate limited by API',
              });
            } else {
              req.reply({
                statusCode: 200,
                body: fixtureData,
                headers: { 'content-type': 'application/json' },
              });
            }
          });
        });

        const writtenChunks = [];
        openPage(origPage, {
          onBeforeLoad(win) {
            mockShowSaveFilePicker(win, "analyses.tsv", {content: writtenChunks});
          },
        });
        cy.get('[data-cy="emg-table-download-button"]').click();
        cy.contains("Downloaded 10 rows of 11").should('be.visible');
        cy.contains("slow down this request").should('be.visible');
        cy.contains("Downloaded 11 rows of 11").should('be.visible');
        cy.contains("Downloaded table to analyses.tsv").should('be.visible');

        cy.wrap(null).then(() => {
          expect(writtenChunks.join('\n')).to.include('MGYA00000011');  // has the second page
        });

        let expectedTimeBeforeSuccessfulPage2 =
          config.whenDownloadingListsFromApi.cadenceMs * 1.5
          + config.whenDownloadingListsFromApi.cadenceMs * 1.5 * 1.5;
        // after first 429, cadence should be 1.5x, and another 1.5x on top after second request
        cy.wrap(null).then(() => {
          expect(
            last(callTimestamps) - first(callTimestamps)
          ).to.be.greaterThan(
            expectedTimeBeforeSuccessfulPage2 * 0.9
          );  // a bit of testing tolerance
        });
      });

      it('Analysis table download should show error if API response is bad', function() {
        // TODO: probably better a unit test rather than e2e here

        cy.intercept('GET', `${config.api_v2}/studies/${projectId}/analyses/?page=2`, {
          statusCode: 500,
          body: 'Internal Server Error',
        }).as('serverError');

        const writtenChunks = [];
        openPage(origPage, {
          onBeforeLoad(win) {
            mockShowSaveFilePicker(win, "analyses.tsv", {content: writtenChunks});
          },
        });
        cy.get('[data-cy="emg-table-download-button"]').click();
        cy.contains("The data cannot be fetched just now").should('be.visible');
      });
    });

    context('Error handling', function() {
        it('Should display error message if invalid accession passed in URL', function() {
            const studyId = 'ERP019566012345';
            const origPageE = 'studies/' + studyId;
            openPage(origPageE);
            cy.contains('Error Fetching Data');
        });
    });

    context('Downloads tab', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            cy.contains('Project 1')
              .should('be.visible');
            changeRouteTab('analysis');
        });
        it('Download links for V6 should be present', function() {
            cy.contains('PRJNA398089_SILVA-SSU_study_summary.tsv').should('be.visible').should('have.attr', 'href');
        });
    });
});
