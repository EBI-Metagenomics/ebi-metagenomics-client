const commons = require('../commons');
require('static/css/pipeline.css');
import {getURLParameter, setCurrentTab, checkAPIonline} from "../util";

checkAPIonline();

setCurrentTab('#about-nav');

let pipeline_version = getURLParameter();

$(document).ready(function () {
    if (pipeline_version <= 0 || pipeline_version - 1 >= commons.pipelines.length) {
        $('#content-full').append("<h3>No pipeline version found, available versions are 1, 2, 3 & 4.</h3>");
    } else {
        $('#content-full').append(commons.pipelines[parseInt(pipeline_version) - 1]);
    }
});