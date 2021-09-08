require('what-input');
require('ebi-framework/libraries/foundation-6/js/foundation.js');
require('ebi-framework/js/script');
require('../../static/js/foundationExtendEBI'); // patched (disabled smoothScrollAnchorLinksEBI)
window.Foundation.addToJquery($);

export const pagination = require('../partials/pagination.handlebars');
export const pagesize = require('../partials/pagesize.handlebars');
export const genericTable = require('../partials/genericTable.handlebars');
export const detailList = require('../partials/detailList.handlebars');
export const biomeFilter = require('../partials/biomeFilter.handlebars');
export const errorTmpl = require('../partials/errorTemplate.handlebars');

export const pipelines = {
    '1.0': require('../partials/pipelines/1.handlebars'),
    '2.0': require('../partials/pipelines/2.handlebars'),
    '3.0': require('../partials/pipelines/3.handlebars'),
    '4.0': require('../partials/pipelines/4.handlebars'),
    '4.1': require('../partials/pipelines/4.1.handlebars'),
    '5.0': require('../partials/pipelines/5.handlebars')
};

require('../../static/images/nucleic_acids_research_D1_cover.gif');
require('../../static/images/funding/BBSRC.png');
require('../../static/images/funding/embl_logo.png');
require('../../static/images/funding/excelerate_whitebackground.png');
require('../../static/images/funding/holofood.png');
require('../../static/images/funding/innovate-uk-logo.png');
require('../../static/images/sourmash_logo.png');
require('../../static/images/ico_graph_krona_on.svg');
require('../../static/images/ico_graph_pie_on.svg');
require('../../static/images/ico_graph_barh_on.svg');
require('../../static/images/ico_graph_col_on.svg');

require('../../static/images/twitter_card/card_image.jpg');
require('../../static/images/twitter_card/card_image_no_ebi_logo.jpg');

require('../../static/images/submission_process.svg');
require('../../static/images/ajax-loader.gif');

require('../../static/images/maps/m1.png');
require('../../static/images/maps/m2.png');
require('../../static/images/maps/m3.png');
require('../../static/images/maps/m4.png');
require('../../static/images/maps/m5.png');

require('style-loader?name=[name].[ext]!../../static/css/elixir-banner.css');
require('style-loader?name=[name].[ext]!../../static/css/ebi-global.css');
require('style-loader?name=[name].[ext]!../../static/css/theme-embl-petrol.css');
require('style-loader!EBI-Icon-fonts/fonts.css');
require('style-loader!EBI-Icon-fonts/EBI-Functional/fonts/EBI-Functional.css');
require('style-loader!EBI-Icon-fonts/EBI-Common/fonts/EBI-Common.css');

require(
    'style-loader?name=[name].[ext]!../../node_modules/tablesorter/dist/css/theme.default.min.css');

require('style-loader!ebi-framework/css/ebi-global.css');
require('style-loader!ebi-framework/css/theme-embl-petrol.css');

require('style-loader!../../static/css/site.css');

export const BLOG_URL = 'https://ebi-metagenomics.github.io/blog/';
export const READTHEDOCS_URL = 'https://emg-docs.readthedocs.io';
export const COOKIE_NAME = 'ebi-metagenomics';
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_PAGE_SIZE_SAMPLES = 10;
export const TAXONOMY_COLOURS = [
    '#058dc7',
    '#82d23d',
    '#e26736',
    '#fbe300',
    '#24cbe5',
    '#c49ecc',
    '#ffc08a',
    '#708090',
    '#6af9c4',
    '#caae74',
    '#cccccc'
];

$(document).foundation();
$(document).foundationExtendEBI();

// keys
export const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

/**
 * Show the message banner.
 * This intended for high priority messages.
 */
const showBanner = () => {
    const apiUrl = process.env.API_URL;
    const url = apiUrl + 'banner-message';
    $.get({url: url, cache: false}).then((response) => {
        if (!response || !response.data || !response.data.message) return;
        const $container = $('<div class="row margin-top-medium"></div>')
            .append($(response.data.message));
        $('#main-content-area').prepend($container);
    });
};
showBanner();
