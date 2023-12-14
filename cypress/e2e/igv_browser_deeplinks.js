describe("IGV Browser", () => {
  it("can update the url bar when the browser locus changes", () => {
    cy.visit("http://localhost:9000/metagenomics/genomes/MGYG000307531?functional-annotation=type#genome-browser");
    cy.wait(10000);
    // cy.get("[name=\"chromosome-select-widget\"]").select("option:nth-child(2)");
    // cy.url().should("include", "functional-annotation=type&feature-id=MGYG000307531_1%3A0-241468.00000000003");
    const div = cy.get('select');
    div.select('option:nth-child(2)');
    console.log('dev', div);
    cy.get('.igv-navbar-genomic-location')
      .find('select')
      .click();

  });
});