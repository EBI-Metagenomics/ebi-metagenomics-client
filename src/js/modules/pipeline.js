const $ = require('jquery');
const commons = require('../commons');
const util = require('../util');
require('static/css/pipeline.css');

util.setupPage('#about-nav');


let pipelineVersion = util.getURLParameter();

$(document).ready(function() {
    if (pipelineVersion <= 0 || pipelineVersion - 1 >= commons.pipelines.length) {
        $('#content-full')
            .append('<h3>No pipeline version found, available versions are 1, 2, 3 & 4.</h3>');
    } else {
        $('#content-full').append(commons.pipelines[parseInt(pipelineVersion) - 1]);
    }
});
