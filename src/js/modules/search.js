import {SEARCH_URL} from '../config';
import {attachTabHandlers, setCurrentTab} from "../util";
const util = require('../util');
const _ = require('underscore');
const Backbone = require('backbone');
import 'foundation-sites';
setCurrentTab('#search-nav');
attachTabHandlers();

/*
* FOLLOWING CODE IS SPECIFIC TO EBI-SEARCH API
* */
const Search = Backbone.Collection.extend({
    tab: null,
    params: {
        query: 'A',
        format: 'json',
        size: 10,
        start: 0,
        fields: 'id,name,biome,description',
        facetcount: 10,
        facetsdepth: 5,
    },
    url: function () {
        return SEARCH_URL + this.tab;
    },
    parse: function (response) {
        if (this.pagination) {
            // TODO pagination
            // Pagination.updatePagination(response.meta.pagination);
        }
        return response.data;
    }
});

const ResultsView = Backbone.View.extend({
    render: function (response) {
        this.$el.html(this.template(response));
        return this.$el
    }
});

const FiltersView = Backbone.View.extend({
    template: _.template($("#filtersTmpl").html()),
    render: function(elem, data, formId){
        data.formId = formId;
        data.elem = elem;
        $(elem).html(this.template(data));
        attachCheckboxHandlers('#'+data.formId);
        _.each(data.facets, function(facet){
            if (facet.type==='slider'){
                let opts = {
                    start: facet.min,
                    end: facet.max,
                    initialStart: facet.min,
                    initialEnd: facet.max,
                    doubleSided: true
                };
                var elem = new Foundation.Slider($('#'+data.formId+facet.label+'slider'), opts);
                $(document).ready(function(){
                    $(elem.$element).on('moved.zf.slider', function(){
                        $('#'+formId).trigger('change');
                    })
                })

            }
        });
        return $(elem);
    }
});

const Project = Backbone.Model.extend({
    parse: function (d) {
        // d.biomes = [];
        // _.each(d.fields.biome, function(biome){
        //     biome = 'root:'+biome.replace(/\/([^\/]*)$/, '').replace(/\//g, ':');
        //     d.biomes.push({
        //         name: util.formatLineage(biome),
        //         icon: util.getBiomeIcon(biome)
        //     });
        // });
        d.biomes = convertBiomes(d);
        d.study_link = '/study/' + d.id;
        return d;
    }
});

const Projects = Search.extend({
    tab: 'projects',
    parse: function (response) {
        let data = response.entries.map(Project.prototype.parse);
        return data;
    }
});

const ProjectsView = ResultsView.extend({
    el: '#projects',
    formEl: 'projectsForm',
    params: {},
    template: _.template($("#projectResultsTmpl").html()),
    initialize: function () {
        //TODO fetch params from session storage
        this.params = Search.prototype.params;

        this.fetchAndRender(true);
    },
    update: function(){
        var formData = removeRedundantBiomes($('#'+this.formEl).serializeArray());
        var joinedFilters = joinFilters(formData);
        this.params.facets = joinedFilters;
        this.fetchAndRender(false);
    },
    fetchAndRender: function(renderFilter){
        const that = this;
        this.collection.fetch({
            data: $.param(that.params),
            success: function (collection, response) {
                if (renderFilter) {
                    filters.render('#projectsFilters', response, that.formEl);
                    $('#'+that.formEl).change(function(){
                        that.update();
                    });
                }
                that.render(response);
            }
        });
    }
});

const Sample = Backbone.Model.extend({
    parse: function (d) {
        d.study_link = '/study/' + d.fields.METAGENOMICS_PROJECTS[0];
        d.sample_link = '/sample/' + d.id;
        return d;
    }
});

const Samples = Search.extend({
    tab: 'samples',
    parse: function (response){
        response.facets.unshift(addSliderFilter('Depth', 'Metres', 0, 2000));
        response.facets.unshift(addSliderFilter('Temperature', '°C', -20, 110));
        response.entries = response.entries.map(Sample.prototype.parse);
        return response;
    }
});

const SamplesView = ResultsView.extend({
    el: '#samples',
    formEl: 'samplesForm',
    params: {},
    template: _.template($("#samplesResultsTmpl").html()),
    initialize: function () {
        //TODO fetch params from session storage
        this.params = Search.prototype.params;
        this.params.fields+=",METAGENOMICS_PROJECTS";
        this.fetchAndRender(true);
    },
    update: function(){
        var formData = processSliders(removeRedundantBiomes($('#'+this.formEl).serializeArray()));
        this.params.query = formData.queryParams.join(" AND ");
        this.params.facets = formData.facets;
        this.fetchAndRender(false);
    },
    fetchAndRender: function(renderFilter){
        const that = this;
        this.collection.fetch({
            data: $.param(that.params),
            success: function (collection, response) {
                if (renderFilter) {
                    filters.render('#samplesFilters', response, that.formEl);
                    $('#'+that.formEl).change(function(){
                        that.update();
                    });
                }
                that.render(response);
            }
        });
    }
});

const Run = Backbone.Model.extend({
    parse: function(d){
        d.study_link = '/study/' + d.fields['METAGENOMICS_PROJECTS'][0];
        d.sample_link = '/sample/' + d.fields['METAGENOMICS_SAMPLES'][0];
        d.run_link = '/run/' + d.id;
        d.pipeline_link = '/pipeline/' + d.fields.pipeline_version[0];
        d.biomes = convertBiomes(d);
        return d;
    }
});

const Runs = Search.extend({
    tab: 'runs',
    parse: function (response){
        response.facets.unshift(addSliderFilter('Depth', 'Metres', 0, 2000));
        response.facets.unshift(addSliderFilter('Temperature', '°C', -20, 110));
        response.entries = response.entries.map(Run.prototype.parse);
        return response;
    }
});

const RunsView = ResultsView.extend({
    el: '#runs',
    formEl: 'runsForm',
    params: {},
    template: _.template($("#runsResultsTmpl").html()),
    initialize: function () {
        //TODO fetch params from session storage
        this.params = Search.prototype.params;
        this.params.fields+=",METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,experiment_type,pipeline_version";
        this.fetchAndRender(true);
    },
    update: function(){
        var formData = processSliders(removeRedundantBiomes($('#'+this.formEl).serializeArray()));
        this.params.query = formData.queryParams.join(" AND ");
        this.params.facets = formData.facets;
        this.fetchAndRender(false);
    },
    fetchAndRender: function(renderFilter){
        const that = this;
        this.collection.fetch({
            data: $.param(that.params),
            success: function (collection, response) {
                if (renderFilter) {
                    filters.render('#runsFilters', response, that.formEl);
                    $('#'+that.formEl).change(function(){
                        that.update();
                    });
                }
                that.render(response);
            }
        });
    }
});

function processSliders(formData){
    const queryNames = ['Temperaturemin', 'Temperaturemax', 'Depthmin', 'Depthmax'];
    const temp = [null, null];
    const depth = [null, null];

    _.each(formData, function(elem){
        if (elem.name==='Temperaturemin') {temp[0] = elem.value;}
        else if (elem.name==='Temperaturemax') {temp[1] = elem.value;}
        else if (elem.name==='Depthmin') {depth[0] = elem.value;}
        else if (elem.name==='Depthmax') {depth[1] = elem.value;}
    });

    return {
        facets: joinFilters(formData.filter(function(elem){
            return (queryNames.indexOf(elem.name)===-1);
        })),
        queryParams: ['temperature:['+temp[0]+' TO '+temp[1]+']', 'depth:[ '+depth[0]+ ' TO '+depth[1]+']']
    }
}

function joinFilters(filters){
    return filters.map(function(elem){
        return elem.name+":"+elem.value;
    }).join(',')
}

function removeRedundantBiomes(formData){
    var newData = formData.filter(function(elem){
        return elem.name!=='biome';
    });
    var biomes = formData.filter(function(elem){
        return elem.name==='biome';
    });
    _.each(biomes, function(biome){
        let parent = null;
        let biomeValue = biome.value;
        if (biomeValue.indexOf('/') > -1){
            var pos = biomeValue.lastIndexOf('/');
            parent = biomeValue.substring(0, pos);
        } else {
            parent = '';
        }
        var parentExists = _.find(biomes, function(biome2){
            return biome2.value===parent
        });

        if (!parentExists){
            newData.push(biome);
        }
    });
    return newData;
}

function setParentCheckboxStatus(elem){
    const parentCheckbox = getParentCheckbox(elem);
    const children = getChildrenCheckboxes(parentCheckbox);
    let checkedChildren = 0;
    let countChildren = children.length;
    let indeterminateChildren = 0;
    _.each(children, function (checkbox) {
        if (checkbox.checked){
            checkedChildren++;
        }
        if ($(checkbox).prop('indeterminate')){
            indeterminateChildren++;
        }
    });

    if (indeterminateChildren>0){
        $(parentCheckbox).prop('indeterminate', true);
        $(parentCheckbox).prop('checked', false);
    } else if (checkedChildren===0){
        $(parentCheckbox).prop('indeterminate', false);
        $(parentCheckbox).prop('checked', false);
    } else if (checkedChildren<countChildren){
        $(parentCheckbox).prop('indeterminate', true);
        $(parentCheckbox).prop('checked', false);
    } else {
        $(parentCheckbox).prop('indeterminate', false);
        $(parentCheckbox).prop('checked', true);
    }
    if (getParentCheckbox(parentCheckbox).val()!==undefined) {
        setParentCheckboxStatus(parentCheckbox);
    }
}

function convertBiomes(entry){
    let biomes = [];
    _.each(entry.fields.biome, function(biome){
        biome = 'root:'+biome.replace(/\/([^\/]*)$/, '').replace(/\//g, ':');
        biomes.push({
            name: util.formatLineage(biome),
            icon: util.getBiomeIcon(biome)
        });
    });
    return biomes;
}

function addSliderFilter(name, units, min, max){
    return {
        type: 'slider',
        label: name,
        units: units,
        min: min,
        max: max
    }
}

function getChildrenCheckboxes(elem){
    return $(elem).siblings('.facet-child-group').children('.facet-checkbox');
}
function getParentCheckbox(elem){
    return $(elem).parent().siblings('.facet-checkbox');
}

/**
 * Waterfall checkbox behaviour (checkbox reflects values of child checkboxes (OFF | Partial | ON)
 */
function attachCheckboxHandlers(elem){
    $(elem).find('.facet-checkbox').on('change', function () {
        // Check children
        $(this).siblings('.facet-child-group').find('.facet-checkbox').prop('checked', this.checked);
        $(this).siblings('.facet-child-group').find('.facet-checkbox').prop('indeterminate', false);

        setParentCheckboxStatus(this);
    });

    $(elem).find('.disp-children').on('click', function(e){
        e.preventDefault();
        const group = $(this).siblings('.facet-child-group');
        group.hasClass('show') ? group.removeClass('show') : group.addClass('show');

        if ($(this).hasClass('open')){
            $(this).removeClass('open');
            $(this).text("\u25B6");
        } else {
            $(this).addClass('open');
            $(this).text("\u25BC");
        }
    });
}

let search = new Search();

let filters = new FiltersView();

let projects = new Projects();
let projectsView = new ProjectsView({collection: projects});

let samples = new Samples();
let samplesView = new SamplesView({collection: samples});

let runs = new Runs();
let runsView = new RunsView({collection: runs});

