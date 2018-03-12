const commons = require('../commons');
const util = require('../util');
require('static/css/pipeline.css');

util.checkAPIonline();

util.setCurrentTab('#about-nav');

let pipeline_version = util.getURLParameter();

$(document).ready(function () {
    if (pipeline_version <= 0 || pipeline_version - 1 >= commons.pipelines.length) {
        $('#content-full').append("<h3>No pipeline version found, available versions are 1, 2, 3 & 4.</h3>");
    } else {
        $('#content-full').append(commons.pipelines[parseInt(pipeline_version) - 1]);
    }
});