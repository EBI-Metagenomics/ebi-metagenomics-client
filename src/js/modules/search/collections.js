const SEARCH_URL = process.env.SEARCH_URL;

const _ = require('underscore');
const Backbone = require('backbone');

const models = require('./models');

/**
 * Generic collection for search results, should only be instantiated via subclass
 */
export const Search = Backbone.Collection.extend({
    tab: null,
    params: {
        format: 'json',
        size: 25,
        start: 0,
        fields: [
            'id',
            'name',
            'biome_name',
            'description'
        ].join(','),
        facetcount: 10,
        facetsdepth: 2
    },
    filterBtnContainer: 'div.btn-container',
    initialize(queryText) {
        if (queryText) { // queryText is a global variable!
            this.params.query = queryText;
        }
    },
    url() {
        return SEARCH_URL + this.tab;
    }
});

/**
 * FacetTimeModel constructor
 * @param {object|FateTimeModel} item starting item with the data
 * @param {FacetTimeModel} parent parent node
 * @return {FacetTimeModel} model with children
 */
function facetItemModelConstructor(item, parent) {
    let queryDomain = item.queryDomain;
    let facetPath = item.facetPath;
    let model = undefined;
    if (parent) {
        queryDomain = parent.get('queryDomain');
        facetPath = parent.get('facetPath') + '/' + item.value;
        // if it's there, get and refresh
        model = parent.get('children').get(item.value);
    }
    if (!model) {
        model = new models.FacetItemModel({
            value: item.value,
            label: item.label,
            count: item.count,
            parent: parent,
            queryDomain: queryDomain,
            facetPath: facetPath,
            children: new FacetsCollection([], {
                facetField: facetPath,
                facetFieldLabel: item.label,
                queryDomain: queryDomain
            })
        });
    }
    if (item.children && item.children.length) {
        const newModels = _.map(item.children, (child) => {
            return facetItemModelConstructor(child, model);
        });
        // expand collection
        model.get('children').set(newModels);
    }
    return model;
}

/**
 * EBI Search Facet collection
 */
export const FacetsCollection = Backbone.Collection.extend({
    model: models.FacetItemModel,
    idAttribute(attrs) {
        return attrs.value;
    },
    initialize(models, options) {
        _.extend(this, _.pick(options,
            'facetField', // e.g.., organism
            'facetFieldLabel', // e.g., Organism
            'queryDomain') // e.g., samples (to build domain_source:metagenomics_samples)
        );
        Backbone.Collection.prototype.initialize.call(this, arguments);
    },
    url() {
        return SEARCH_URL + this.queryDomain;
    },
    fetch(options) {
        const args = $.extend(true, {
            data: {
                query: 'domain_source:metagenomics_' + this.queryDomain,
                size: 1,
                start: 0,
                facetcount: 10,
                facetsdepth: 3,
                facetfields: this.facetField
            }
        }, options || {});
        return Backbone.Collection.prototype.fetch.call(this, args);
    },
    parse(response) {
        let entries = [];
        const facet = _.first(response.facets);

        if (!facet) return entries;

        _.each(facet.facetValues, (facetValue) => {
            // if already exists, extend
            const oldModel = this.get(facetValue.value);
            if (oldModel) {
                _.each(facetValue.children, (child) => {
                    return facetItemModelConstructor(
                        _.extend(child, {
                            facetField: this.facetField,
                            facetFieldLabel: this.facetFieldLabel,
                            queryDomain: this.queryDomain
                        }), oldModel
                    );
                });
                entries.push(oldModel);
            } else {
                // else, create
                const newModel = facetItemModelConstructor(
                    _.extend(facetValue, {
                        // passing for inner collections
                        // i.e. organism/Bacteria/Proteobacteria/...
                        facetPath: this.facetField + '/' + facetValue.value,
                        facetField: this.facetField,
                        facetFieldLabel: this.facetFieldLabel,
                        queryDomain: this.queryDomain
                    })
                );
                entries.push(newModel);
            }
        });

        return entries;
    }
});

/**
 * Collection of analysis results to call parser
 */
export const Analyses = Search.extend({
    tab: 'analyses',
    parse(response) {
        response.entries = response.entries.map(models.Analysis.prototype.parse);
        return response;
    }
});

/**
 * Collection of project results to call parser for each result
 */
export const Projects = Search.extend({
    tab: 'projects',
    parse(response) {
        return response.entries.map(models.Project.prototype.parse);
    }
});

/**
 * Collection of sample results to call parser
 */
export const Samples = Search.extend({
    tab: 'samples',
    parse(response) {
        // response.facets.unshift(addSliderFilter("Depth", "Metres", 0, 2000));
        // response.facets.unshift(addSliderFilter("Temperature", "°C", -20, 110));
        response.entries = response.entries.map(models.Sample.prototype.parse);
        return response;
    }
});
