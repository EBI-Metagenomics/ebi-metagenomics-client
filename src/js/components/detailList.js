const tmpl = require('../commons').detailList;
const _ = require('underscore');

/**
 * Widget for a simple bullet point list with key/value entries
 * @type {module.DetailList}
 */
module.exports = class DetailList {
    /**
     * Create a detailList from template and return jQuery elem
     * @param {string} title
     * @param {[{key: string, value: string}]} properties
     * @return {jQuery.HTMLElement}
     */
    constructor(title, properties) {
        return $(tmpl({
            title: title,
            properties: properties,
            listContainer: _.uniqueId('listContainer')
        }));
    }
};
