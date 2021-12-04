const $ = require('jquery');
const igv = require('igv');
const igvPopup = require('../components/igvPopup');

module.exports = class GenomeBrowser {
    /**
     * Genome Browser
     * @param {string} containerId DOM elemenet id
     * @param {Object} reference Object with the fasta and the fasta_index urls.
     * @param {[Object]} tracks IGV Tracks configuration options.
     */
    constructor(containerId, reference, tracks) {
        const $container = $('#' + containerId);
        $container.empty();

        const browserDivId = containerId + '-browser';
        const $browserDiv = $('<div id="' + browserDivId +
            '"class="genome-browser-container"></div>');

        $container.append($browserDiv);

        let options = {
            showChromosomeWidget: false,
            showTrackLabelButton: true,
            showTrackLabels: true,
            showCenterGuide: false,
            showAllChromosomes: true,
            reference: {
                fastaURL: reference.fasta_url,
                indexURL: reference.fasta_index_url
            },
            tracks: tracks,
            showLegend: true,
            legendGroups: {cog: true, antiSMASH: false, other: true},
            legendParent: '#genome-browser'
        };

        igv.createBrowser(document.getElementById(browserDivId), options).then((browser) => {
            $('.loading-gif-large').hide();
            browser.on('trackclick', (ignored, data) => {
                return igvPopup(data);
            });
        });
    }
};
