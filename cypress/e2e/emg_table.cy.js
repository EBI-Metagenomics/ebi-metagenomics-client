import { openPage } from '../util/util';

const rows = [3, 1, 4, 2].map((score) => ({ attributes: { score } }));

// Use the application's React instance, as in the contig navigation tests.
function renderTable(clientSidePagination, initialEntry = '/') {
  openPage('');
  cy.window().then(async (win) => {
    const { mountTable } = await win.eval(
      "import('/metagenomics/cypress/util/tableHarness.jsx')"
    );
    const container = win.document.createElement('div');
    container.id = 'table-regression';
    win.document.body.prepend(container);
    win.tableRegressionRoot = mountTable(
      container,
      rows,
      clientSidePagination,
      initialEntry
    );
  });
}

const expectScores = (scores) =>
  cy.get('#table-regression tbody td').should(($cells) => {
    expect([...$cells].map((cell) => Number(cell.textContent))).to.deep.equal(
      scores
    );
  });

afterEach(() => {
  cy.window().then((win) => {
    win.tableRegressionRoot?.unmount();
    win.document.getElementById('table-regression')?.remove();
  });
});

describe('Shared table pagination and sorting', () => {
  it('sorts client rows and preserves nested accessor ordering parameters', () => {
    renderTable(true);
    expectScores([3, 1]);
    cy.get('#table-regression .vf-pagination__item--next-page button').click();
    expectScores([4, 2]);
    cy.get('[data-cy="table-location"]').should('contain.text', 'demoPage=2');
    cy.contains('#table-regression th', 'Score').click();
    expectScores([1, 2]);
    cy.get('[data-cy="table-location"]')
      .should('contain.text', 'demoOrder=score')
      .and('not.contain.text', 'demoPage');
    cy.contains('#table-regression th', 'Score').click();
    expectScores([4, 3]);
    cy.get('[data-cy="table-location"]').should(
      'contain.text',
      'demoOrder=-score'
    );
  });

  it('preserves server rows while paging and sorting through URL state', () => {
    renderTable(false, '/?demoPage=3&demoOrder=-score');
    expectScores([3, 1]);
    cy.get('[data-cy="table-location"]').should('contain.text', 'demoPage=3');
    cy.get('#table-regression .vf-pagination__item--next-page button').click();
    cy.get('[data-cy="table-location"]').should('contain.text', 'demoPage=4');
    expectScores([3, 1]);
    cy.contains('#table-regression th', 'Score').click();
    cy.contains('#table-regression th', 'Score').click();
    cy.get('[data-cy="table-location"]')
      .should('contain.text', 'demoOrder=score')
      .and('not.contain.text', 'demoPage');
    expectScores([3, 1]);
  });
});
