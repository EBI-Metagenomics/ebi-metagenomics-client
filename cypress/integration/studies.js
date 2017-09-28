describe('Nav test '+origPage+'->'+destPage, function() {
    it('Navbar link is valid.', function() {
        openPage(origPage);
        cy.get('#'+destPage+'-nav').click();
        if (origPage!=='overview') {
            cy.url().should('include', destPage);
        }
        cy.get('h2').should('contain', pageTitles[dest]);
    });
});