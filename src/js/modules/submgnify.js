const Backbone = require('backbone');
const _ = require('underscore');
const INTERPRO_URL = process.env.INTERPRO_URL;
const Commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;
const util = require('../util');
const ClientSideTable = require('../components/clientSideTable');

const DetailList = require('../components/detailList');

require('tablesorter');

const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

const DEFAULT_PAGE_SIZE = 25;

util.setupPage('#browse-nav');

window.Foundation.addToJquery($);

let analysisID = util.getURLParameter();
util.specifyPageTitle('Analysis', analysisID);
