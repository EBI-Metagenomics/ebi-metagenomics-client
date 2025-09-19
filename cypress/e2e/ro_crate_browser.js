describe.skip('RO-Crate Browser', () => {
  it('Can browse an RO crate from the Contig viewer page', () => {
    tryToBrowseAnRoCrate('http://localhost:9000/metagenomics/analyses/MGYA00000001?selected_contig=ERZ8153470.8-NODE-8-length-192555-cov-12.276894#contigs-viewer', ($iframe) => {
      verifySanntisCrateIframeContents($iframe);
    });
  });

  it('Can browse an RO crate from Assembly extra annotations', () => {
    tryToBrowseAnRoCrate('http://localhost:9000/metagenomics/assemblies/ERZ8153470', ($iframe) => {
      verifySanntisCrateIframeContents($iframe);
    });
  });

  it('Can browse an RO crate from Run extra annotations', () => {
    tryToBrowseAnRoCrate('http://localhost:9000/metagenomics/runs/SRR8845517', ($iframe) => {
      verifyMotusCrateIframeContents($iframe);
    });
  });
});

const tryToBrowseAnRoCrate = (location, verifyIframeContents) => {
  cy.visit(location);
  const roCrateBrowserButton = '.ro-crate-browser-button';
  cy.get(roCrateBrowserButton).should('exist');
  cy.wait(1000);
  cy.get(roCrateBrowserButton).last().click();
  cy.get('iframe').should('be.visible');
  cy.get('iframe').then(($iframe) => {
    verifyIframeContents($iframe);
    cy.get('.modal-close-button').click();
  });
};

const verifySanntisCrateIframeContents = ($iframe) => {
  cy.wrap($iframe.contents().find('a:contains("ERZ8153470.sanntis.gff")')).should('not.be.empty');
};

const verifyMotusCrateIframeContents = ($iframe) => {
  cy.wrap($iframe.contents().find('a:contains("multiqc")'))
      .should('not.be.empty')
      .then(($multiqcAnchor) => {
        $multiqcAnchor[0].click();
        cy.wrap($iframe.contents().find('a:contains("Home")')).should('not.be.empty');
      });
};


