const sortBySelector = '#sortBy';


var Util = module.exports = {
    openPage: function (origPage) {
        let url = 'http://localhost:8080/' + (origPage !== 'overview' ? origPage : '');
        cy.visit(url);
    },
    setSortBy: function (optionValue, numResults, waitCallback){
        cy.get(sortBySelector).select('-last_update');
        waitCallback(numResults);
    }
};