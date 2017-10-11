
export const header = require("../partials/header.handlebars");
export const footer = require("../partials/footer.handlebars");
export const pagination = require("../partials/pagination.handlebars");
export const pagesize = require("../partials/pagesize.handlebars");
export const resultsFilter = require("../partials/results_filter.handlebars");

require('html-loader?path=../name=[name].[ext]!../about.html');
require('html-loader?path=../name=[name].[ext]!../biomes.html');
require('html-loader?path=../name=[name].[ext]!../compare.html');
require('html-loader?path=../name=[name].[ext]!../contact.html');
require('html-loader?path=../name=[name].[ext]!../run.html');
require('html-loader?path=../name=[name].[ext]!../sample.html');
require('html-loader?path=../name=[name].[ext]!../samples.html');
require('html-loader?path=../name=[name].[ext]!../search.html');
require('html-loader?path=../name=[name].[ext]!../studies.html');
require('html-loader?path=../name=[name].[ext]!../study.html');
require('html-loader?path=../name=[name].[ext]!../submit.html');
require('html-loader?path=../name=[name].[ext]!../index.html');

require('style-loader?name=[name].[ext]!../../static/css/site.css');
require('style-loader?name=[name].[ext]!../../static/css/ebi-global.css');
require('style-loader?name=[name].[ext]!../../static/css/foundation.css');
require('style-loader?name=[name].[ext]!../../static/css/theme-embl-petrol.css');
require('style-loader?name=[name].[ext]!../../static/fonts/fonts.css');

require('file-loader?name=[name].[ext]!../../static/images/backgrounds/bgd_transparent_1x1.png');
require('file-loader?name=[name].[ext]!../../static/images/backgrounds/bgd_header_microbes_30p.png');
require('file-loader?name=[name].[ext]!../../static/images/backgrounds/bgd_header_microbes_big_10p.png');
require('file-loader?name=[name].[ext]!../../static/images/backgrounds/bgd_button_login_off.gif');
require('file-loader?name=[name].[ext]!../../static/images/nucleic_acids_research_D1_cover.gif');
require('file-loader?name=[name].[ext]!../../static/images/ico_biome_sprite.png');
require('file-loader?name=[name].[ext]!../../static/images/logos/EMBL-EBI/EMBL_EBI_Logo_white.svg');
require('file-loader?name=[name].[ext]!../../static/images/logos/EMBL-EBI/EMBL_EBI_Logo_black.svg');
require('file-loader?name=[name].[ext]!../../static/images/map.png');
