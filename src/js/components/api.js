const Backbone = require('backbone');
const Commons = require('../commons');
const API_URL = process.env.API_URL;
const NO_DATA_MSG = Commons.NO_DATA_MSG;
const util = require('../util');
import {formatDate, formatLineage, getBiomeIcon, lineage2Biome, getBiomeIconData} from "../util";

const _ = require('underscore');

const ENA_VIEW_URL = Commons.EBI_ENA_VIEW_URL;
const EUROPE_PMC_ENTRY_URL = Commons.EBI_EUROPE_PMC_ENTRY_URL;
const DX_DOI_URL = Commons.DX_DOI_URL;

// Model for an individual study
export const Study = Backbone.Model.extend({
    url: function () {
        return API_URL + 'studies/' + this.id;
    },
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        const biomes = data.relationships.biomes.data.map(getBiomeIconData);
        return {
            bioproject: attr['bioproject'],
            biomes: biomes,
            study_link: util.subfolder + "/studies/" + data.id,
            samples_link: util.subfolder + "/studies/" + data.id + "#samples-section",
            study_name: attr['study-name'],
            samples_count: attr['samples-count'],
            study_id: data.id,
            study_accession: attr['accession'],
            last_update: formatDate(attr['last-update']),
            abstract: attr['study-abstract'],
            ena_url: ENA_VIEW_URL + data.id
        }
    }
});

// Model for a collection of studies,
export const StudiesCollection = Backbone.Collection.extend({
    url: API_URL + "studies",
    model: Study,
    initialize: function (params, url) {
        if (url) {
            this.url = url;
        }
        if (params) {
            this.params = params;
        }
    },
    parse: function (response) {
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
        const sample_id = rel.sample.data.id;
        const study_id = rel.study.data.id;
        return {
            run_id: attr['accession'],
            // analyses: [{
            //     experiment_type: 'A',
            //     pipeline_version: 'x.x',
            //     date: 'xx/xx/xxxx'
            // }],
            sample_id: sample_id,
            sample_url: util.subfolder + '/samples/' + sample_id,
            run_url: util.subfolder + '/runs/' + attr.accession,
            experiment_type: attr['experiment-type'],
            instrument_model: attr['instrument-model'],
            instrument_platform: attr['instrument-platform'],
            pipeline_versions: pipelines.data.map(function (x) {
                return x.id
            }),
            analysis_results: 'TAXONOMIC / FUNCTION / DOWNLOAD',
            study_id: study_id,
            study_url: util.subfolder + '/studies/' + study_id,
        }
    }
});

export function getKronaURL(run_id, pipeline_version) {
    return API_URL + "runs/" + run_id + "/pipelines/" + pipeline_version + "/krona"
}

export const RunCollection = Backbone.Collection.extend({
    url: API_URL + 'runs',
    model: Run,
    initialize: function (data) {
        // Project/sample ID
        if (data.hasOwnProperty(('study_accession'))) {
            this.study_accession = data.study_accession;
        }
        // Sample ID
        if (data.hasOwnProperty(('sample_accession'))) {
            this.sample_accession = data.sample_accession;
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
            samples_count: attr['samples-count'],
            // lineage_projects_no_children: attr['studies-count'],
            biome_studies_link: util.subfolder + '/browse?lineage=' + lineage + '#studies',
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
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;

        let metadatas = _.map(attr['sample-metadata'], function (el) {
            const key = el.key;
            return {
                name: key[0].toUpperCase() + key.slice(1),
                value: el.value
            }
        });

        // Adaption to handle 'includes' on API calls which would wrap the response
        const biome = data.relationships.biome;
        const biome_name = biome.data.id;
        return {
            biome_icon: getBiomeIcon(biome_name),
            biome_name: formatLineage(biome_name),
            sample_name: attr['sample-name'] || NO_DATA_MSG,
            sample_desc: attr['sample-desc'],
            sample_url: util.subfolder + '/samples/' + attr['accession'],
            sample_accession: attr.accession || NO_DATA_MSG,
            lineage: formatLineage(biome.data.id || NO_DATA_MSG),
            metadatas: metadatas,
            runs: d.included,
            last_update: formatDate(attr['last-update']),
            latitude: attr.latitude,
            longitude: attr.longitude,
        }
    }
});

export const SamplesCollection = Backbone.Collection.extend({
    url: API_URL + "samples",
    model: Sample,
    initialize: function (data) {
        // Sample ID
        if (data && data.hasOwnProperty('study_accession')) {
            this.study_accession = data.study_accession;
        }
    },
    parse: function (response) {
        return response.data;
    }
});

export const RunPipelineObject = Backbone.Model.extend({
    initialize: function (params) {
        this.id = params.id;
        this.version = params.version;
        if (params.hasOwnProperty('type')) {
            this.type = params.type;
        }
    }
});

export const Analysis = RunPipelineObject.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/' + this.version;
    },
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attr = data.attributes;
        return {
            experiment_type: attr['experiment-type'],
            analysis_summary: attr['analysis-summary'],
            complete_time: attr['complete-time'],
            instrument_model: attr['instrument-model'],
            instrument_platform: attr['instrument-platform'],
            pipeline_version: attr['pipeline-version'],
            download: attr['download']
        }
    }
});

export const Taxonomy = RunPipelineObject.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/' + this.version + '/taxonomy' + this.type;
    },
    fetch: function () {
        const that = this;
        const promise = $.Deferred();
        let data = [];
        $.get({
            url: this.url(),
            success: function (response) {
                data = data.concat(response.data);
                const numPages = response.meta.pagination.pages;
                if (numPages > 1) {
                    let requests = [];
                    for (let x = 2; x <= numPages; x++) {
                        requests.push($.get(that.url() + '?page=' + x));
                    }
                    $.when.apply($, requests).done(function () {
                        let page = 2;
                        _.each(requests, function (response) {
                            if (response.responseJSON === undefined || response.responseJSON.data === undefined) {
                                console.error('Could not retrieve data for page ', page);
                            } else {
                                data = data.concat(response.responseJSON.data);
                            }
                            page++;
                        });
                        promise.resolve(data);
                    });
                } else {
                    promise.resolve(data);
                }
            }
        });
        return promise;
    }
});

export const InterproIden = RunPipelineObject.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/' + this.version + '/interpro-identifiers';
    },
});

export const GoSlim = RunPipelineObject.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/' + this.version + '/go-slim';
    }
});

export const Publication = Backbone.Model.extend({
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attrs = data.attributes;
        let authors = attrs['authors'];
        if (authors.length > 50) {
            authors = authors.split(',').slice(0, 5);
            authors.push(' et al.');
            authors = authors.join(',');
        }
        return {
            pubmed_id: attrs['pubmed-id'],
            title: attrs['pub-title'],
            authors: authors,
            doi: attrs['doi'],
            pmc_url: EUROPE_PMC_ENTRY_URL + attrs['pubmed-id'],
            doi_url: DX_DOI_URL + attrs['doi'],
            year: attrs['published-year'],
            volume: attrs['volume']
        }
    }
});

function clusterStudyDownloads(downloads) {
    const pipelines = {};
    _.each(downloads, function (download) {
        const attr = download.attributes;
        const group = attr['group-type'];
        const pipeline = download.relationships.pipeline.data.id;

        attr['link'] = download.links.self;
        if (!pipelines.hasOwnProperty(pipeline)) {
            pipelines[pipeline] = {};
        }
        if (!pipelines[pipeline].hasOwnProperty(group)) {
            pipelines[pipeline][group] = [];
        }

        pipelines[pipeline][group] = pipelines[pipeline][group].concat(download);
    });
    return pipelines
}


function clusterRunDownloads(downloads) {
    const groups = {};
    _.each(downloads, function (download) {
        const attr = download.attributes;
        const group = attr['group-type'];
        const label = attr.description.label;

        attr['links'] = [download.links.self];

        if (!groups.hasOwnProperty(group)) {
            groups[group] = [];
        }
        let grouped = false;
        _.each(groups[group], function (d) {
            if (d.attributes.description.label === label) {
                d.attributes.links = d.attributes.links.concat(download.links.self);
                grouped = true;
            }
        });
        if (!grouped) {
            groups[group] = groups[group].concat(download);
        }
    });

    return groups
}

export const StudyDownloads = Backbone.Model.extend({
    url: function () {
        return API_URL + 'studies/' + this.id + '/downloads';
    },
    parse: function (response) {
        this.attributes.pipelineFiles = clusterStudyDownloads(response.data);
    }
});

export const RunDownloads = Backbone.Model.extend({
    url: function () {
        return API_URL + 'runs/' + this.id + '/pipelines/' + this.attributes.version + '/downloads';
    },
    parse: function (response) {
        this.attributes.downloadGroups = clusterRunDownloads(response.data);
    }
});

export const StudyGeoCoordinates = Backbone.Model.extend({
    url: function () {
        return API_URL + 'studies/' + this.study_accession + '/geocoordinates?page_size=500';
    },
    initialize: function (study_accession) {
        this.study_accession = study_accession;
    }
});