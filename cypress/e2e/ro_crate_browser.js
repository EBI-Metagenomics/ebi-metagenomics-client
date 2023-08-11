describe("RO-Crate Browser", () => {
  it("Can browse an RO crate from the Contig viewer page", () => {
    tryToBrowseAnRoCrate("http://localhost:9000/metagenomics/analyses/MGYA00000001?selected_contig=ERZ8153470.8-NODE-8-length-192555-cov-12.276894#contigs-viewer", ($iframe) => {
      sanntisIframeContentsVerifier($iframe);
    });
  });

  it("Can browse an RO crate from Assembly extra annotations", () => {
    tryToBrowseAnRoCrate("http://localhost:9000/metagenomics/assemblies/ERZ8153470", ($iframe) => {
      sanntisIframeContentsVerifier($iframe);
    });
  });

  it('Can browse an RO crate from Run extra annotations', () => {
    tryToBrowseAnRoCrate('http://localhost:9000/metagenomics/runs/SRR8845517', ($iframe) => {
      motusIframeContentsVerifier($iframe);
    });
  });
});

const tryToBrowseAnRoCrate = (location, iframeContentsVerifier) => {
  cy.visit(location);
  const roCrateBrowserButton = ".ro-crate-browser-button";
  // cy.get(".ro-crate-browser-button").should("exist");
  cy.get(roCrateBrowserButton).should("exist");
  cy.wait(1000);
  cy.get(roCrateBrowserButton).last().click();
  cy.get("iframe").should("be.visible");
  cy.get("iframe").then($iframe => {
    iframeContentsVerifier($iframe);
    cy.wait(1000);
    cy.get(".modal-close-button").click();
  });
};

const sanntisIframeContentsVerifier = ($iframe) => {
  cy.wrap($iframe.contents().find("a:contains(\"ERZ8153470.sanntis.gff\")")).should("not.be.empty");
};

const motusIframeContentsVerifier = ($iframe) => {
  cy.wrap($iframe.contents().find("a:contains(\"multiqc\")"))
    .should("not.be.empty")
    .then(($multiqcAnchor) => {
      cy.wait(1000);
      $multiqcAnchor[0].click();
      cy.wait(1000);
      cy.wrap($iframe.contents().find("a:contains(\"Home\")")).should("not.be.empty");
    });
}



