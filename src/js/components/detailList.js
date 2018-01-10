const tmpl = require('../commons').detailList;
const _ = require('underscore');

module.exports = class DetailList {
    constructor(title, properties) {
        return $(tmpl({
            title: title,
            properties: properties
        }));
    }
};