const tableTmpl = require('../commons').genericTable;
const BaseTable = require('./baseTable.js');

module.exports = class GenericTable extends BaseTable {
    /**
     * Render the handlebars template
     * @param {Object} params Table initialization options
     * @return {String} the rendered HTML
     */
    renderTemplate(params) {
        return $(tableTmpl(params));
    }
};
