const igv = require('../../../static/js/igv.min.js');

function getLegendElem(key, color){
    const $legendEntry = $('<div class="legend-entry"></div>');
    const $color = $('<div class="legend-color" style="background:'+color+'"></div>');
    const $label = $('<div class="legend-label">'+key+'</div>');
    $legendEntry.append($color);
    $legendEntry.append($label);
    return $legendEntry;
}

module.exports = class GenomeBrowser {
    constructor(containerId, config) {
        const $container = $('#'+containerId);
        $container.empty();
        const browserDivId = containerId +'-browser';
        const $browserDiv = $('<div id="'+browserDivId+'"class="genome-browser-container"></div>');
        const $legend = $('<div class="genome-browser-legend"></div>');

        $container.append($browserDiv);
        $container.append($legend);
        window.colors = {};

        function renderLegend(){
            $legend.empty();
            if (window.colorBy !== undefined){
                const legendData = window.colors[window.colorBy];
                const $legendHeader = $('<h3>Legend</h3>');
                $legend.append($legendHeader);

                const keys = Object.keys(legendData).sort();
                for (var key of keys){
                    if (legendData.hasOwnProperty(key)){
                        const $entry = getLegendElem(key, legendData[key]);
                        $legend.append($entry);
                    }
                }
            }
        }

        window.regen_legend=renderLegend;

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