const tmpl = require('../commons').detailList;
const _ = require('underscore');

/**
 * Widget for a simple bullet point list with key/value entries
 * @type {module.DetailList}
 */
module.exports = class DetailList {
    constructor(title, properties) {
        console.log(properties);
        return $(tmpl({
            title: title,
            properties: properties
        }));
    }
};