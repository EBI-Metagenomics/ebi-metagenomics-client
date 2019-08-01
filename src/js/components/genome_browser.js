const igv = require('../../../static/js/igv.min.js');
const ClientSideTable = require('./clientSideTable');
const api = require('mgnify').api(process.env.API_URL);

function getLegendElem(key, color) {
    const $legendEntry = $('<div class="legend-entry"></div>');
    const $color = $('<div class="legend-color" style="background:' + color + '"></div>');
    const $label = $('<div class="legend-label">' + key + '</div>');
    $legendEntry.append($color);
    $legendEntry.append($label);
    return $legendEntry;
}

function initLegendTable($container) {
    const headers = [
        {sortBy: 'a', name: ''},
        {sortBy: 'a', name: 'Name'},
        {sortBy: 'a', name: 'Description'}
    ];

    const options = {
        title: '',
        headers: headers,
        initPageSize: 25
    };
    return new ClientSideTable($container, options);
}

// const cogs = new api.CogCategories();
// cogs.url = 'http://127.0.0.1:8000/v1/cogs';
// const keggModules = new api.KeggModules();
// keggModules.url = 'http://127.0.0.1:8000/v1/kegg-modules';
// const keggClasses = new api.KeggClasses();
// keggClasses.url = 'http://127.0.0.1:8000/v1/kegg-classes';

// const refLoaded = $.when(cogs.fetch(), keggModules.fetch(), keggClasses.fetch());
// window.refLoaded = refLoaded;
module.exports = class GenomeBrowser {
    constructor(containerId, config) {
        const $container = $('#' + containerId);
        $container.empty();
        const browserDivId = containerId + '-browser';
        const $browserDiv = $('<div id="' + browserDivId +
            '"class="genome-browser-container"></div>');
        const $legendContainer = $('<div class="genome-browser-legend"></div>');

        $container.append($browserDiv);
        $container.append($legendContainer);
        window.colors = {};
        const legendTable = initLegendTable($legendContainer);

        function renderLegend() {
            // const data = _.map(phylumPie.clusteredData, function(d) {
            //     const colorDiv = util.getColourSquareIcon(i);
            //     return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)];
            // });
            // phylumPieTable.update(data, false, 1);
            // $legend.empty();
            if (window.colorBy !== undefined) {
                const legendData = window.colors[window.colorBy];
                const $legendHeader = $('<h3>Legend</h3>');
                $legend.append($legendHeader);

                const keys = Object.keys(legendData).sort();
                for (var key of keys) {
                    if (legendData.hasOwnProperty(key)) {
                        const $entry = getLegendElem(key, legendData[key]);
                        $legend.append($entry);
                    }
                }
            }
        }

        window.regen_legend = renderLegend;

        let igvDiv = document.getElementById(browserDivId);
        let options =
            {
                reference: {
                    id: config['name'],
                    fastaURL: config['fasta_url'],
                    indexURL: config['fasta_index_url'],
                    index: true
                },
                tracks: [
                    {
                        name: config['name'],
                        url: config['gff_url'],
                        format: 'gff',
                        displayMode: 'EXPANDED'
                    }
                ],
                color_fields: [
                    '',
                    'COG',
                    'product',
                    'Pfam',
                    'KEGG',
                    'InterPro',
                    'eggNOG'
                ]
            };
        window.igv_config = options;
        igv.createBrowser(igvDiv, options).then(function(browser) {
            console.debug('Created IGV browser');
        });
    }
};