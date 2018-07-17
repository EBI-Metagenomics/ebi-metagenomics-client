const $ = require('jquery');
const commons = require('../commons');
const util = require('../util');
require('static/css/pipeline.css');

util.setupPage('#about-nav');

let pipelineVersion = util.getURLParameter();

$(document).ready(function() {
    const pipelineVersions = Object.keys(commons.pipelines);

    if (pipelineVersions.indexOf(pipelineVersion) === -1) {
        const dispPipelineVersions = pipelineVersions.slice(0, -1).join(', ') + '& ' +
            pipelineVersions.pop() + '.';
        $('#content-full')
            .append('<h3>No pipeline version found, available versions are ' +
                dispPipelineVersions + '</h3>');
    } else {
        $('#content-full').append(commons.pipelines[pipelineVersion]);
    }
});
