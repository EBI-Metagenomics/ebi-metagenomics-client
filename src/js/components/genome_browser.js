const igv = require('../../../static/js/igv.min.js');

module.exports = class GenomeBrowser {
    constructor(containerId, config) {
        let igvDiv = document.getElementById(containerId);
        igvDiv.innerHTML = "";
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
            console.log('Created IGV browser');
        });
    }
};