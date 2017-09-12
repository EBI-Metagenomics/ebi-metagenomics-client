import Backbone from 'backbone';
import _ from 'underscore';
import * as util from 'src/main';
import Pagination from './pagination';

// Model for an individual study
export const Study = Backbone.Model.extend({
    url: function () {
        return util.API_URL + 'studies/' + this.id;
    },
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        const biomes = data.relationships.biomes.data.map(function (x) {
            return x.id;
        });
        const biome_list = biomes.map(function (x) {
            return util.formatLineage(x)
        });
        return {
            biome_name: biomes,
            biome_icon: biomes.map(util.getBiomeIcon),
            study_link: "/study/" + data.id,
            study_name: attr['study-name'],
            samples_count: attr['samples-count'],
            study_id: attr['project-id'],
            study_accession: attr['accession'],
            last_update: util.formatDate(attr['last-update']),
            contact_details: {
                institute: attr['centre-name'] || util.NO_DATA_MSG,
                name: attr['author-name'] || util.NO_DATA_MSG,
                email: attr['author-email'] || util.NO_DATA_MSG,
            },
            abstract: attr['study-abstract'],
            classifications: biome_list,
            samples: d.included
        }
    }
});

// Model for a collection of studies,
export const StudiesCollection = Backbone.Collection.extend({
    url: util.API_URL + "studies",
    model: Study,
    parse: function (response) {
        Pagination.updatePagination(response.meta.pagination);
        return response.data;
    }
});

export const Run = Backbone.Model.extend({
    url: function () {
        return util.API_URL + 'runs/' + this.id;
    },
    parse: function (d) {
        // Adaption to handle 'includes' on API calls which would wrap the response
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        const rel = data.relationships;
        const pipelines = rel.pipelines;
        const analysis = rel.analysis;

        return {
            run_id: attr['accession'],
            analyses: [{
                experiment_type: 'A',
                pipeline_version: 'x.x',
                date: 'xx/xx/xxxx'
            }],
            sample_name: "N/A",
            sample_id: attr['sample-accession'],
            sample_url: '/sample/' + attr['sample-accession'],
            run_url: '/run/' + attr.accession,
            experiment_type: data.relationships['experiment-type'].data.id,
            instrument_model: attr.instrument_model || util.NO_DATA_MSG,
            pipeline_version: pipelines.data.map(function (x) {
                return x.id
            }).join(", "),
            analysis_results: 'TAXONOMIC / FUNCTION / DOWNLOAD'
        }
    }
});

export const RunCollection = Backbone.Collection.extend({
    url: util.API_URL + 'runs',
    model: Run,
    initialize: function (data) {
        this.pid = data.pid;
    },

    parse: function (response) {
        return response.data
    }
});

export const Biome = Backbone.Model.extend({
    url: function () {
        var base = util.API_URL + 'biomes';
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },
    parse: function (data) {
        // Work-around when requesting root biome
        if (data.data) {
            data = data.data;
        }
        var lineage = data.attributes.lineage.match(/[\w|\s]*(root.*)/g)[0].trim();
        return {name: lineage};
    }
});

export const BiomeCollection = Backbone.Collection.extend({
    model: Biome,
    url: util.API_URL + "biomes/root/children",
    parse: function (response) {
        return response.data
    }
});

export const Sample = Backbone.Model.extend({
    url: function () {
        return util.API_URL + 'samples/' + this.id;
    },
    parse: function (d) {
        // Adaption to handle 'includes' on API calls which would wrap the response
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        return {
            biome_icon: util.getBiomeIcon(data.relationships.biome.data.id),
            biome_name: data.relationships.biome.data.id,
            sample_name: attr['sample-name'] || util.NO_DATA_MSG,
            sample_desc: attr['sample-desc'],
            sample_link: "/sample/" + attr['accession'],
            study_accession: attr['study-accession'] || util.NO_DATA_MSG,
            study_link: '/study/' + attr['study-accession'],
            sample_accession: attr.accession || util.NO_DATA_MSG,
            investigation_type: 'N/A' || util.NO_DATA_MSG,
            geo_location: attr['geo-loc-name'] || util.NO_DATA_MSG,
            collection_date: attr['collection-date]'] || util.NO_DATA_MSG,
            env_biome: attr['environment-biome'] || util.NO_DATA_MSG,
            env_feature: attr['environment-feature'] || util.NO_DATA_MSG,
            env_material: attr['environment-material'] || util.NO_DATA_MSG,
            env_package: util.NO_DATA_MSG,
            elevation: util.NO_DATA_MSG,
            ncbi_class: util.NO_DATA_MSG,
            depth: util.NO_DATA_MSG,
            inst_model: util.NO_DATA_MSG,
            lineage: util.formatLineage(data.relationships.biome.data.id || util.NO_DATA_MSG),
            runs: d.included,
        }
    }
});

export const SamplesCollection = Backbone.Collection.extend({
    url: util.API_URL + "samples",
    model: Sample,
    parse: function (response) {
        return response.data;
    }
});