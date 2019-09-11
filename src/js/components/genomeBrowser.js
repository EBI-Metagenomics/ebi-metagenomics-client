const _ = require('underscore');
const $ = require('jquery');
const igv = require('igv').default;
require('style-loader!../../../static/css/genome-browser.css');


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
            reference: {
                fastaURL: config['fasta_url'],
                indexURL: config['fasta_index_url'],
                index: true
            },
            tracks: [
                {
                    name: config['name'],
                    url: config['gff_url'],
                    format: 'gff3',
                    displayMode: 'EXPANDED'
                }
            ],
            ebi: {
                colorAttributes: [
                    'Colour by',
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

        this.$igvPopoverTpl = _.template($('#igv-popover-template').html());
        this.$igvPopoverEntryTpl = _.template($('#igv-popover-entry').html());

        igv.createBrowser(document.getElementById(browserDivId), options).then((browser) => {
            $('.loading-gif-large').hide();
            browser.on('trackclick', (ignored, data) => {
                if (!data || !data.length) {
                    return false;
                }

                let attributes = _.where(data, (d) => {
                    return d.name;
                });

                if (attributes.length === 0) {
                    return false;
                }

                attributes = _.reduce(attributes, (memo, el) => {
                    memo[el.name.toLowerCase()] = el.value;
                    return memo;
                }, {});

                /**
                 * Get a key from the attributes
                 * @param {*} key Dict Key
                 * @param {*} def default value
                 * @return {*} the value or default
                 */
                function getAttribute(key, def) {
                    def = def || '';
                    if (_.has(attributes, key)) {
                        // eslint-disable-next-line security/detect-object-injection
                        return attributes[key];
                    } else {
                        return def;
                    }
                }

                // eslint-disable-next-line valid-jsdoc
                /**
                 * S
                 * @param {*} key Key.
                 * @return {*} The table with the data or an empty string
                 */
                function getAttrMultiValue(key, linkHref) {
                    const val = getAttribute(key, '');
                    if (val === '') {
                        return '';
                    }
                    const data = val.split(',');
                    return that.$igvPopoverEntryTpl({
                        values: data.map((d) => {
                            return {
                                name: d,
                                link: (linkHref) ? linkHref + d : ''
                            };
                        })
                    });
                }

                const functionalData = {
                    title: 'Functional annotation',
                    data: [{
                        name: 'E.C Number',
                        value: getAttrMultiValue('ec_number', 'https://enzyme.expasy.org/EC/')
                    }, {
                        name: 'Pfam',
                        value: getAttrMultiValue('pfam', 'https://pfam.xfam.org/family/')
                    }, {
                        name: 'KEGG',
                        value: getAttrMultiValue(
                            'kegg', 'https://www.genome.jp/dbget-bin/www_bget?')
                    }, {
                        name: 'eggNOG',
                        value: getAttrMultiValue('eggnog')
                    }, {
                        name: 'COG',
                        value: getAttrMultiValue('cog')
                    }, {
                        name: 'InterPro',
                        value: getAttrMultiValue(
                            'interpro', 'https://www.ebi.ac.uk/interpro/beta/entry/InterPro/')
                    }]
                };

                const otherData = {
                    title: 'Feature details',
                    data: [{
                        name: 'Type',
                        value: getAttribute('type')
                    }, {
                        name: 'Inference',
                        value: getAttribute('inference')
                    }, {
                        name: 'Start / End',
                        value: getAttribute('start') + ' / ' + getAttribute('end')
                    }]
                };

                const markup = that.$igvPopoverTpl({
                    name: getAttribute('id'),
                    gene: getAttribute('gene'),
                    product: getAttribute('product'),
                    properties: [functionalData, otherData]
                });

                return markup;
            });
        });
    }
};
