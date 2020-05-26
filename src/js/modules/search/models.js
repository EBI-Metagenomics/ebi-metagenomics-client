const util = require('../../util');
const _ = require('underscore');
const Backbone = require('backbone');

const helpers = require('./helpers');

/**
 * EBI Search Facet filter
 */
export const FacetItemModel = Backbone.Model.extend({
    defaults: {
        label: '',
        value: '',
        count: 0,
        checked: false,
        expanded: false,
        visible: true,
        facetPath: '',
        parent: undefined,
        // this won't be undefined, it's
        // assigned when created in recursion
        children: undefined
    },
    loadMore() {
        return this.get('children').fetch({
            data: {
                facetcount: 500,
                facetsdepth: 3,
                facetfields: this.get('facetPath')
            }
        });
    },
    isRoot() {
        return _.isUndefined(this.get('parent'));
    },
    hasChildren() {
        return this.get('children').length > 0;
    },
    /**
     * Get the first element of the path.
     * This corresponds to the facet field.
     * @return {string}
     */
    getFacetPathRoot() {
        return _.first(this.get('facetPath').split('/'));
    },
    toggleChecked() {
        this.set('checked', !this.get('checked'));
    },
    toggleExpanded() {
        this.set('expanded', !this.get('expanded'));
    }
});

/**
 * Project model parser
 */
export const Project = Backbone.Model.extend({
    parse(d) {
        d.biomes = helpers.convertBiomes(d);
        d.studyLink = util.subfolder + '/studies/' + d.id;

        // Fix for ebi search issues
        if (d.fields.ENA_PROJECT.length === 0) {
            d.fields.ENA_PROJECT = d.fields.id;
        }
        return d;
    }
});

/**
 * Sample model parser
 */
export const Sample = Backbone.Model.extend({
    parse(d) {
        d.studyLink = util.subfolder + '/studies/' +
            d.fields.METAGENOMICS_PROJECTS[0];
        d.sampleLink = util.subfolder + '/samples/' + d.id;
        return d;
    }
});

/**
 * Analysis model parser
 */
export const Analysis = Backbone.Model.extend({
    parse(d) {
        d.analysisId = d.fields['name'][0];
        d.studyLink = util.subfolder + '/studies/' +
            d.fields['METAGENOMICS_PROJECTS'][0];
        d.sampleLink = util.subfolder + '/samples/' +
            d.fields['METAGENOMICS_SAMPLES'][0];
        d.analysisLink = util.subfolder + '/analyses/' + d.fields['name'][0] +
            '?version=' + d.fields.pipeline_version[0];
        d.pipelineLink = util.subfolder + '/pipelines/' +
            d.fields.pipeline_version[0];
        d.biomes = helpers.convertBiomes(d);
        d.assemblyLink = d.fields['ASSEMBLY'][0];
        d.runLink = d.fields['ENA_RUN'][0];
        return d;
    }
});
