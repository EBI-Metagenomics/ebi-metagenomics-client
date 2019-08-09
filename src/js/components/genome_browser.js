const igv = require('igv').default;
require('style-loader!../../../static/css/genome-browser.css');


module.exports = class GenomeBrowser {
    /**
     * Genome Browser
     * @param {string} containerId DOM elemenet id
     * @param {object} config Configuration settings.
     */
    constructor(containerId, config) {
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
            ebi: {
                colorAttributes: [
                    '',
                    'COG',
                    'product',
                    'Pfam',
                    'KEGG',
                    'InterPro',
                    'eggNOG'
                ],
                showLegendButton: true
            }
        };

        igv.createBrowser(document.getElementById(browserDivId), options).then((browser) => {
            console.debug('Created IGV browser'); // TODO remove this.
        });
    }
};
