

var Util = module.exports = {
    openPage: function (origPage) {
        let url = 'http://localhost:8080/' + (origPage !== 'overview' ? origPage : '');
        cy.visit(url);
    }
};