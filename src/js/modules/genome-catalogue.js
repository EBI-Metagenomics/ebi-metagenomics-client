const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const util = require('../util');
const marked = require('marked');

require('../../../static/js/jquery.liveFilter.js');
const PhyloTree = require('../components/phyloTree');
const GenomesSearchView = require("../components/genomeSearch");
const GenomesSearchMAGView = require("../components/genomeSearchMAG");


util.setupPage('#browse-nav');

let genomeCatalogueId = util.getURLParameter();

let GenomeCatalogueView = Backbone.View.extend({
    model: api.GenomeCatalogue,
    template: _.template($('#genomeCatalogueTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            success() {
                that.model.set({
                    catalogue_description:
                        marked(that.model.attributes.catalogue_description || ''),
                    protein_catalogue_description:
                        marked(that.model.attributes.protein_catalogue_description || '')
                });
                that.$el.html(that.template(that.model.toJSON()));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status,
                    'Could not retrieve Genome Catalogue: ' + genomeCatalogueId);
            }
        });
    }
});

/**
 * Method to initialise page load
 */
function initPage() {
    let genomeCatalogue = new api.GenomeCatalogue({id: genomeCatalogueId});
    let genomeCatalogueView = new GenomeCatalogueView({model: genomeCatalogue});

    let genomes = new api.GenomeCatalogueGenomeCollection({catalogue_id: genomeCatalogueId});

    genomeCatalogueView.fetchAndRender().done(() => {
        // Set the document title.
        document.title = genomeCatalogueView.model.attributes.catalogue_name + ' genomes';
        new util.GenomesView({
            collection: genomes,
            initPageSize: 10,
            domSelector: '#genomes-section',
            sectionTitle: 'Genomes'
        });

        util.attachExpandButtonCallback();
        new GenomesSearchView({
            api_url: api.API_URL + "genome-search",
            catalogue_id: genomeCatalogueView.model.id,
        });
        new GenomesSearchMAGView({
            api_url: api.API_URL,
            catalogue_id: genomeCatalogueView.model.id,
        });
    });

    /**
     * Generate the phylogenetic tree
     * @param {string} catalogueId Genome Catalogue ID
     */
    function genPhyloTree(catalogueId) {
        new api.GenomeCatalogueDownloads({id: catalogueId}).fetch().done((response) => {
            const url = util.findFileUrl(response.data, 'phylo_tree.json');
            new PhyloTree('phylo-tree', url);
        });
    }
    genPhyloTree(genomeCatalogueId);
    
}

initPage();
