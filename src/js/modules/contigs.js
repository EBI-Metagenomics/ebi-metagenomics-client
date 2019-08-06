/*
    We want this sort of functionality.
    So - two major issues on the website to address.
    1) Find a contig of interest
    2) Visualise the contig and colour according to different features.
    I think IGV allows you to do most of 2
    May be not is a really nice way yet.
    Selecting the colours is not really intuitive.
    Finding the contig, may require some work on the backend....
*/

const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const ClientSideTable = require('../components/clientSideTable');
require('tablesorter');

const igv = require('igv').default;

// TODO: PENDING INTEGRATION WITH THE WEBKIT
const API_URL = 'http://localhost:9000/metagenomics/api/v1';

util.setupPage('#browse-nav');
window.Foundation.addToJquery($);

const DEFAULT_PAGE_SIZE = 10;

let AnalysesContig = Backbone.Model.extend({
    parse(data) {
        return {
            name: data.attributes.name,
            length: data.attributes.length
        };
    }
});

let ContigCollection = Backbone.Collection.extend({
    model: AnalysesContig,
    initialize(options) {
        this.accession = options.accession;
    },
    url() {
        return API_URL + '/analyses/' + this.accession + '/contigs';
    },
    parse(response) {
        return response.data;
    }
});

let ContigsView = Backbone.View.extend({

    el: $('#contigs-containter'),

    events: {
        'click .contig-browser': 'contigViewer'
    },

    initialize() {
        this.$popoverTemplate =_.template($('#igv-popup-template').html());
    },

    render() {
        const that = this;
        const tableOptions = {
            tableContainer: 'contigs-table',
            title: 'Contigs',
            headers: [
                {sortBy: null, name: 'Name'},
                {sortBy: null, name: 'Length (pb)'}
            ],
            initPageSize: DEFAULT_PAGE_SIZE,
            textFilter: true
        };

        const contigsTable = new ClientSideTable($('#contigs-table'), tableOptions);

        this.collection.fetch({
            success() {
                const data = _.reduce(that.collection.models, (arr, model) => {
                    arr.push([
                        '<a href="#" class="contig-browser" data-name="' +
                        model.attributes.name +
                        '">' +
                        model.attributes.name +
                        '</a>',
                        model.attributes.length
                    ]);
                    return arr;
                }, []);
                contigsTable.update(data, false, 1);
                // Load the first one
                $('#contigs-table .contig-browser').first().trigger('click');
            }, error(error) {
                // TODO HANDLE THIS
                console.log(error);
            }
        });
    },

    /**
     * View a contig using IGV.
     * @param {Event} e the event
     */
    contigViewer(e) {
        e.preventDefault();
        $('#gb-loading').removeClass('hidden');
        const name = $(e.target).data('name');
        let options = {
            showChromosomeWidget: false,
            reference: {
                indexed: false,
                fastaURL: API_URL + '/analyses/' +
                    this.collection.accession + '/contigs/' + name
            },
            tracks: [{
                name: name,
                type: 'annotation',
                format: 'gff3',
                url: API_URL + '/analyses/' +
                    this.collection.accession + '/annotations/' + name,
                displayMode: 'EXPANDED'
            }]
        };
        const $igvDiv = $('#genome-browser');
        if (this.igvBrowser) {
            igv.removeBrowser(this.igvBrowser);
        }
        igv.createBrowser($igvDiv, options).then((browser) => {
            // Hide the label (for one contigs it doesn't make sense)
            browser.hideTrackLabels();

            // Customize the track Pop Over
            browser.on('trackclick', (ignored, data) => {
                $('#gb-loading').removeClass('hidden');
                if (!data || !data.length) {
                    return false;
                }
                // Attributes
                let attributes = _.where(data, (d) => {
                    return d.name;
                });

                if (attributes.length === 0) {
                    return false;
                }
                // By returning a string from the trackclick handler
                // we're asking IGV to use our custom HTML in its pop-over.
                const markup = this.$popoverTemplate({attributes: attributes});
                $('#gb-loading').addClass('hidden');
                return markup;
            });
            this.igvBrowser = browser;
            $('#gb-loading').addClass('hidden');
        });
    }
});

let collection = new ContigCollection({accession: 'MGYA00135572'});
let view = new ContigsView({collection: collection});

view.render();
