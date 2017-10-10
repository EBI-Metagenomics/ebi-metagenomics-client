import Backbone from 'backbone';
import Pagination from './pagination';
import {API_URL, NO_DATA_MSG} from '../config';
import {formatDate, formatLineage, getBiomeIcon, lineage2Biome} from "../util";

// Model for an individual study
export const Study = Backbone.Model.extend({
    url: function () {
        return API_URL + 'studies/' + this.id;
    },
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        const biomes = data.relationships.biomes.data.map(function (x) {
            const name = x.id;
            return {name: formatLineage(name), icon: getBiomeIcon(name)};
        });
        return {
            biomes: biomes,
            study_link: "/study/" + data.id,
            samples_link: "/study/"+data.id,
            study_name: attr['study-name'],
            samples_count: attr['samples-count'],
            study_id: attr['project-id'],
            study_accession: attr['accession'],
            last_update: formatDate(attr['last-update']),
            abstract: attr['study-abstract'],
            samples: d.included
        }
    }
});

// Model for a collection of studies,
export const StudiesCollection = Backbone.Collection.extend({
    url: API_URL + "studies",
    model: Study,
    initialize: function(pagination){
        this.pagination = pagination;
    },
    parse: function (response) {
        if (this.pagination) {
            Pagination.updatePagination(response.meta.pagination);
        }
        return response.data;
    }
});

export const Run = Backbone.Model.extend({
    url: function () {
        return API_URL + 'runs/' + this.id;
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
            // analyses: [{
            //     experiment_type: 'A',
            //     pipeline_version: 'x.x',
            //     date: 'xx/xx/xxxx'
            // }],
            sample_name: "N/A",
            sample_id: attr['sample-accession'],
            sample_url: '/sample/' + attr['sample-accession'],
            run_url: '/run/' + attr.accession,
            experiment_type: data.relationships['experiment-type'].data.id,
            instrument_model: attr.instrument_model || NO_DATA_MSG,
            pipeline_versions: pipelines.data.map(function (x) {
                return x.id
            }),
            analysis_results: 'TAXONOMIC / FUNCTION / DOWNLOAD',
            study_id: attr['study-accession'],
            study_url: '/study/' + attr['study-accession'],
        }
    }
});

export const RunCollection = Backbone.Collection.extend({
    url: API_URL + 'runs',
    model: Run,
    initialize: function (data) {
        // Project/sample ID
        if (data.hasOwnProperty(('study_id'))) {
            this.study_id = data.study_id;
        }
        // Sample ID
        if (data.hasOwnProperty(('sample_id'))) {
            this.sample_id = data.sample_id;
        }
    },
    parse: function (response) {
        return response.data
    }
});

export const Biome = Backbone.Model.extend({
    url: function () {
        var base = API_URL + 'biomes';
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },
    parse: function (data) {
        // Work-around when requesting root biome
        if (data.data) {
            data = data.data;
        }
        const attr = data.attributes;
        const lineage = attr['lineage'];
        return {
            name: lineage2Biome(lineage),
            icon: getBiomeIcon(lineage),
            lineage: lineage,
            lineage_projects : attr['studies-count'],
            // lineage_projects_no_children: attr['studies-count'],
            biome_studies_link: '/studies?biome='+lineage,
            // biome_studies_link_no_children: 'TODO2',
        };
    }
});

export const BiomeCollection = Backbone.Collection.extend({
    model: Biome,
    url: API_URL + "biomes/root/children",
    parse: function (response) {
        return response.data
    }
});


export const Sample = Backbone.Model.extend({
    url: function () {
        return API_URL + 'samples/' + this.id;
    },
    parse: function (d) {
        let metadatas = [];
        if (d.hasOwnProperty('included')){
            metadatas = d.included.filter(function (el) {
                return el.type === 'sample-anns';
            }).map(function (el) {
                const attr = el.attributes;
                const name = attr['var-name'];
                return {
                    name: name[0].toUpperCase() + name.slice(1),
                    value: attr['var-value'] + ' ' + attr['unit']
                }
            });
        }

        // Adaption to handle 'includes' on API calls which would wrap the response
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        const biome = data.relationships.biome;
        const biome_name = biome.data.id;
        return {
            biome_icon: getBiomeIcon(biome_name),
            biome_name: formatLineage(biome_name),
            sample_name: attr['sample-name'] || NO_DATA_MSG,
            sample_desc: attr['sample-desc'],
            sample_link: "/sample/" + attr['accession'],
            study_accession: attr['study-accession'] || NO_DATA_MSG,
            study_link: '/study/' + attr['study-accession'],
            sample_accession: attr.accession || NO_DATA_MSG,
            lineage: formatLineage(biome.data.id || NO_DATA_MSG),
            metadatas: metadatas,
            runs: d.included,
            last_update: formatDate(attr['last-update'])
        }
    }
});

export const SamplesCollection = Backbone.Collection.extend({
    url: API_URL + "samples",
    model: Sample,
    parse: function (response) {
        return response.data;
    }
});

export const Analysis = Backbone.Model.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/'+this.version;
    },
    initialize: function(params){
        this.id = params.id;
        this.version = params.version;
    }
});

export const AnalysisMetadata = Backbone.Model.extend({
    url: function(){
        return API_URL + 'runs/' + this.id + '/pipelines/'+this.version+'/metadata';
    },
    initialize: function(params){
        this.id = params.id;
        this.version = params.version;
    }
});
