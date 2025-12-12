import {openPage, waitForPageLoad} from '../util/util';
import config from 'utils/config';

const origPage = 'browse';

describe('Browse page', function() {
    beforeEach(function() {
        cy.intercept('GET', `${config.api_v2}/super-studies/**`,
          {fixture: 'apiv2/super-studies/superStudiesList.json'});
    });

    context('Super studies table', function() {
        beforeEach(function() {
            openPage(origPage + '/super-studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of super studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(1)').should('contain.text', 'Excellent');
        });

        it('Should have markdown rendered description', function() {
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.html', '<strong>excellent adventure</strong>');
        });

        it('Should have download button', function() {
            cy.contains('Download').should('be.visible');
        });

    });
    context('Studies table', function() {
        beforeEach(function() {
            cy.intercept('GET', `${config.api_v2}/biomes/**`,
              {fixture: 'apiv2/biomes/biomeList.json'}).as('biomes');
            cy.intercept('GET', `${config.api_v2}/studies/**`,
              {fixture: 'apiv2/studies/studyListAll.json'}).as('studies');
            cy.intercept({
                method: 'GET',
                url: `${config.api_v2}/studies/**`,
                query: {biome_lineage: 'root:Engineered'}
              },
              {fixture: 'apiv2/emptyList.json'}).as('studiesForEngineered');
            openPage(origPage + '/studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.text', 'MGYS00000001');
        });

        it('Should respond to biome filtering', function() {
            cy.get('#biome-select').click();
            cy.contains('All Engineered').click();
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
            cy.contains('No matching data');
        });
    });

  context('Samples table', function() {
    beforeEach(function() {
      cy.intercept('GET', `${config.api_v2}/biomes/**`,
        {fixture: 'apiv2/biomes/biomeList.json'}).as('biomes');
      cy.intercept('GET', `${config.api_v2}/samples/**`,
        {fixture: 'apiv2/samples/sampleListAll.json'}).as('samples');
      cy.intercept({
          method: 'GET',
          url: `${config.api_v2}/samples/**`,
          query: {biome_lineage: 'root:Engineered'}
        },
        {fixture: 'apiv2/samples/sampleListEngineered.json'}).as('samplesForEngineered');
      openPage(origPage + '/samples');
      waitForPageLoad('Browse MGnify');
    });

    it('Should contain correct number of samples', function() {
      cy.get('.mg-table-caption').should('contain.text', 3);
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 3);
      cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.text', 'SAMN07793787');
    });

    it('Should respond to biome filtering', function() {
      cy.get('#biome-select').click();
      cy.contains('All Engineered').click();
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
    });
  });
        //TODO list genome catalogues

        //TODO list biomes

        //TODO list publications

        //TODO list samples
});
