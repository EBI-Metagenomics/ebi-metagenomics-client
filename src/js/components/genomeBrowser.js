const $ = require('jquery');
const igv = require('igv');
const igvPopup = require('../components/igvPopup');

module.exports = class GenomeBrowser {
    /**
     * Genome Browser
     * @param {string} containerId DOM elemenet id
     * @param {object} config Configuration settings.
     */
    constructor(containerId, config) {
        const that = this;
        const $container = $('#' + containerId);
        $container.empty();

        const browserDivId = containerId + '-browser';
        const $browserDiv = $('<div id="' + browserDivId +
            '"class="genome-browser-container"></div>');

        $container.append($browserDiv);

        let options = {
            showTrackLabelButton: false,
            showTrackLabels: false,
            showCenterGuide: false,
            showAllChromosomes: true,
            reference: {
                fastaURL: config['fasta_url'],
                indexURL: config['fasta_index_url'],
                index: true
            },
            tracks: [{
                type: 'mgnify-annotation',
                name: config['name'],
                url: config['gff_url'],
                format: 'gff3',
                displayMode: 'EXPANDED'
            }, {
                colorAttributes: [
                    ['Default', ''],
                    ['COG', 'COG'],
                    ['Product', 'product'],
                    ['Pfam', 'Pfam'],
                    ['KEGG', 'KEGG'],
                    ['InterPro', 'InterPro'],
                    ['eggNOG', 'eggNOG']
                ]
            }],
            showLegend: true,
            legendParent: '#genome-browser'
        };

        igv.createBrowser(document.getElementById(browserDivId), options).then((browser) => {
            $('.loading-gif-large').hide();
            browser.on('trackclick', (ignored, data) => {
                return igvPopup(data, that.$igvPopoverTpl, that.$igvPopoverEntryTpl);
            });
        });
    }
};
