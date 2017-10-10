import Config from './config';
const sortBySelector = '#sortBy';


var Util = module.exports = {
    openPage: function (origPage) {
        let url = Config.BASE_URL + (origPage !== 'overview' ? origPage : '');
        cy.visit(url);
    },
    setSortBy: function (optionValue, numResults, waitCallback){
        cy.get(sortBySelector).select('-last_update');
        waitCallback(numResults);
    }
};