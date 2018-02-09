const searchUrl = process.env.SEARCH_URL;
import {attachTabHandlers, setCurrentTab} from "../util";

const util = require('../util');
const _ = require('underscore');
const Backbone = require('backbone');
const Cookies = require('js-cookie');

const commons = require('../commons');
const Pagination = require('../components/pagination').Pagination;
require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/css');
import 'foundation-sites';
import '../../../static/libraries/jquery.TableCSVExport';

const CheckboxTree = require('../components/checkboxTree');

const Slider = require('../components/slider.js');

util.checkAPIonline();

setCurrentTab('#search-nav', true);
attachTabHandlers();

$("#pageSize").append(commons.pagesize).find('#pagesize').change(function () {
    updateAll($(this).val())
});

function getPageSize() {
    return $('#pagesize').val();
}

let queryText = util.getURLFilterParams().get('query');
$("#navbar-query").val(queryText);

$(document).ready(function () {
    //TODO convert to template argument
    $("#pagesize-text").hide();
});

const COOKIE_NAME = 'ebi-metagenomics';
const SLIDER_PARAM_RE = /(\w+):\[\s*([-]?\d+) TO ([-]?\d+)\]/;

const Search = Backbone.Collection.extend({
    tab: null,
    params: {
        format: 'json',
        size: 10,
        start: 0,
        fields: 'id,name,biome_name,description',
        facetcount: 10,
        facetsdepth: 5,
    },
    filterBtnContainer: 'div.btn-container',
    initialize: function () {
        if (queryText) {
            this.params.query = queryText;
        }
    },
    url: function () {
        return searchUrl + this.tab;
    },
    parse: function (response) {
        if (this.pagination) {
            // TODO pagination
            // Pagination.update(response.meta.pagination);
        }
        return response.data;
    }
});

const ResultsView = Backbone.View.extend({
    render: function (response, params, no_display, columns) {
        let templateData = $.extend({}, response);
        const defaultQueries = [ProjectsView.prototype.defaultQuery, SamplesView.prototype.defaultQuery, RunsView.prototype.defaultQuery];

        if (defaultQueries.indexOf(params.query) === -1) {
            const splitParams = params.query.split(' AND ');
            templateData.queryText = _.reject(splitParams, isFacetParam)[0];

            const sliderParams = _.filter(splitParams, isFacetParam);
            templateData.sliderText = sliderParams.join(', ');
        } else {
            templateData.queryText = null;
            templateData.sliderText = null;
        }

        // if (params.facets && params.facets.length > 0) {
        //     templateData.filterText = params.facets.replace(/,/g, ', ');
        // } else {
        //     templateData.filterText = null;
        // }
        templateData.filterText = null;
        templateData['subfolder'] = util.subfolder;
        if (!no_display) {
            const $data = $(this.template(templateData));
            $data.find("td").map(function () {
                if (columns.indexOf($(this).attr('data-column')) === -1) {
                    $(this).hide();
                }
            });
            // $data.find("td[data-column='"+column+"']").show();
            this.$el.html($data);
        } else {
            return this.template(templateData);
        }
    },
    fetchCSV: function ($buttonElem) {
        $buttonElem.prop('disabled', true);
        $buttonElem.addClass('loading-cursor');
        let tmpParams = $.extend(true, {}, this.params);
        tmpParams.facetcount = 0;
        tmpParams.facetsdepth = 1;
        const maxSize = 100;
        const totalResults = this.totalResults;
        const that = this;
        let fetches = [];
        for (let start = 0; start < totalResults; start += maxSize) {
            const number = Math.min(maxSize, totalResults - start);
            let p = $.extend(true, {}, tmpParams);
            p.start = start;
            p.size = number;
            fetches.push(this.collection.fetch({
                data: $.param(p),
                success: function (collection, response) {
                    return collection;
                }
            }));
        }

        $.when.apply($, fetches).done(function () {
            let args;
            if (typeof(arguments[1])==='string'){
                args = [arguments];
            } else {
                args = arguments;
            }
            let collection = null;
            // Concatenate collection entries onto first collection
            for (var i = 0; i < args.length; i++) {
                if (!collection) {
                    collection = args[i][0];
                } else {
                    collection.entries = collection.entries.concat(args[i][0].entries);
                }
            }
            const resultsTmpl = that.render(collection, tmpParams, true, []);
            $(resultsTmpl).filter('table').TableCSVExport({
                showHiddenRows: true,
                delivery: 'download'
            });
        }).fail(function () {
            alert('Could not download, an error has occured');
            //    TODO improve error handling
        }).always(function () {
            $buttonElem.removeClass('loading-cursor');
            $buttonElem.prop('disabled', false);
        });
    }
});

const FiltersView = Backbone.View.extend({
    template: _.template($("#filtersTmpl").html()),
    render: function (elem, data, formId, query) {
        data.formId = formId;
        data.elem = elem;
        $(elem).html(this.template(data));
        // attachCheckboxHandlers('#' + data.formId);
        _.each(data.facets, function (facet) {
            if (facet.type === 'slider') {
                const initValues = getFacetValues(facet.label, query);

                const initData = (initValues && initValues.length === 2) ? initValues : [facet.min, facet.max];
                const sliderId = '#' + data.formId + facet.label + 'slider';
                $(sliderId).slider({
                    range: true,
                    min: facet.min,
                    max: facet.max,
                    values: initData,
                    minInput: $(this).siblings('[data-min]'),
                    maxInput: $(this).siblings('[data-max]'),
                    slide: function (event, ui) {
                        const inputSelector = ui.handleIndex ? '[data-max]' : '[data-min]';
                        $(this).siblings(inputSelector).val(ui.value);
                        const sliderSelector = $(this).attr('data-facet-slider');
                        // Apply to other facet's sliders and inputs
                        _.each(getAllFormIds(), function (formId) {
                            if (formId !== '#' + data.formId) {
                                const $slider = $(formId).find('[data-facet-slider=' + sliderSelector + ']').slider('values', ui.handleIndex, ui.value);
                                $slider.siblings(inputSelector).val(ui.value).trigger('change');
                            }
                        });
                        updateAll();
                    },
                    create: function (event, ui) {
                        $(this).siblings('[data-min]').val(initData[0]);
                        $(this).siblings('[data-max]').val(initData[1]);
                        $(this).siblings('.slider-input').on('change', function (e) {
                            const index = $(this).is('[data-min]') ? 0 : 1;
                            const val = parseInt($(this).val());
                            $(sliderId).slider('values', index, val);

                            // Apply to other facet's sliders and inputs
                            const sliderSelector = $(sliderId).attr('data-facet-slider');
                            const inputSelector = index ? '[data-max]' : '[data-min]';
                            _.each(getAllFormIds(), function (formId) {
                                if (formId !== '#' + data.formId) {
                                    const $slider = $(formId).find('[data-facet-slider=' + sliderSelector + ']');
                                    $slider.slider('values', index, val);
                                    $slider.siblings(inputSelector).val(val);
                                }
                            });
                            if (e.hasOwnProperty('originalEvent')) {
                                updateAll();
                            }
                        });
                    }
                })
            }
        });
        $('#' + formId).find('.switch-input').click(sliderToggleCallback);
        return $(elem);
    }
});

function getFacetValues(label, query) {
    let params = query.split(' AND ');
    for (let i = 0; i < params.length; i++) {
        const d = SLIDER_PARAM_RE.exec(params[i]);
        if (d && d[1] === label) {
            return _.map(d.slice(2, 3), parseInt);
        }
    }
}

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
        d.study_link = util.subfolder + '/studies/' + d.id;
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
        formEl: 'projectsFilters',
        params: {},
        pagination: new Pagination(),
        template: _.template($("#projectResultsTmpl").html()),
        defaultQuery: 'domain_source:metagenomics_projects',

        initialize: function () {
            this.pagination.setPaginationElem('#projects-pagination');
            const cookieParams = loadSearchParams('projects');
            this.params = $.extend(true, {}, Search.prototype.params);
            if (cookieParams) {
                this.params.facets = cookieParams.filters || "";
                this.params.query = getQueryText() || cookieParams.query || this.defaultQuery;
            } else {
                this.params.facets = "";
                this.params.query = getQueryText() || this.defaultQuery;
            }
            this.params.fields = "ENA_PROJECT,METAGENOMICS_RUNS,METAGENOMICS_SAMPLES,biome_name,centre_name,creation_date,description,domain_source,id,last_modification_date,name,releaseDate_date";
            // this.params.query = this.defaultQuery;
        },

        update: function (page, pagesize) {
            let formData = removeRedundantFilters($('#' + this.formEl).serializeArray());
            this.params.facets = joinFilters(formData);
            if (!this.params.query.length) {
                this.params.query = this.defaultQuery;
            }
            if (pagesize) {
                this.params.size = pagesize;
            } else {
                this.params.size = getPageSize();
            }
            if (page) {
                this.params.start = parseInt(this.params.size) * (page - 1);
            } else {
                this.params.start = 0;
            }
            return this.fetchAndRender(false, false);
        },

        fetchAndRender: function (renderFilter, setFilters) {
            const that = this;
            return this.collection.fetch({
                data: $.param(that.params),
                success: function (collection, response) {
                    that.totalResults = response.hitCount;
                    saveSearchParams('projects', that.params.facets, that.params.query);

                    const columns = getVisibleColumns('projects') || ['project-ena-accession', 'project-id', 'project-biome', 'project-centre-name'];

                    that.render(response, that.params, false, columns);
                    if (renderFilter) {
                        createDataTable('projects', $('#projectsTable'), $('#projectsModal'), columns);
                        that.pagination.init(1, that.params.size, Math.ceil(response.hitCount / that.params.size), response.hitCount, function (page) {
                            that.update(page);
                        });
                    } else {
                        const pageObj = getPagesObj(response.hitCount, that.params.start, that.params.size);
                        that.pagination.update(pageObj, function (page) {
                            that.update(page);
                        });
                    }

                    $(that.el).find("button[name='download']").click(function () {
                        that.fetchCSV($(this));
                    });
                }
            }).promise();
        },
    })
;

function getPagesObj(hitcount, start, size) {
    let page = (parseInt(start) / parseInt(size)) + 1;
    let pages = Math.ceil(parseInt(hitcount) / parseInt(size)) || 1;
    return {
        page: page,
        pages: pages,
    }

}

const Sample = Backbone.Model.extend({
    parse: function (d) {
        d.study_link = util.subfolder + '/studies/' + d.fields.METAGENOMICS_PROJECTS[0];
        d.sample_link = util.subfolder + '/samples/' + d.id;
        return d;
    }
});

const Samples = Search.extend({
    tab: 'samples',
    parse: function (response) {
        // response.facets.unshift(addSliderFilter('Depth', 'Metres', 0, 2000));
        // response.facets.unshift(addSliderFilter('Temperature', '°C', -20, 110));
        response.entries = response.entries.map(Sample.prototype.parse);
        return response;
    }
});

const SamplesView = ResultsView.extend({
    el: '#samples',
    formEl: 'samplesFilters',
    params: {},
    template: _.template($("#samplesResultsTmpl").html()),
    defaultQuery: 'domain_source:metagenomics_samples',
    pagination: new Pagination(),

    setDefaultParams: function () {
        this.params = $.extend(true, {}, Search.prototype.params);
        this.params.fields += ",METAGENOMICS_PROJECTS,project_name,biome_name";
        this.params.searchQuery = this.defaultQuery;
    },

    initialize: function () {
        //TODO fetch params from session storage
        this.pagination.setPaginationElem('#samples-pagination');

        const cookieParams = loadSearchParams('samples');
        this.params = $.extend(true, {}, Search.prototype.params);
        this.params.fields += ",METAGENOMICS_PROJECTS,project_name,biome_name";

        if (cookieParams) {
            this.params.facets = cookieParams.filters || '';
            this.params.query = getQueryText() || cookieParams.query || this.defaultQuery;
        } else {
            this.params.query = getQueryText() || this.defaultQuery;
        }
    },
    update: function (page = 1, pagesize = 25) {
        var formData = processSliders(removeRedundantFilters($('#' + this.formEl).serializeArray()));
        this.params.facets = joinFilters(formData.facets || []);
        const queryText = getQueryText();
        if (queryText) {
            formData.queryParams.push(queryText);
        }
        this.params.query = formData.queryParams.join(' AND ');

        if (this.params.query === '') {
            this.params.query = this.defaultQuery;
        }

        if (pagesize) {
            this.params.size = pagesize;
        } else {
            this.params.size = getPageSize();
        }
        if (page) {
            this.params.start = parseInt(this.params.size) * (page - 1);
        } else {
            this.params.start = 0;
        }
        return this.fetchAndRender(false, false);
    },
    fetchAndRender: function (renderFilter, setFilters) {
        const that = this;
        return this.collection.fetch({
            data: $.param(this.params),
            success: function (collection, response) {
                that.totalResults = response.hitCount;
                saveSearchParams('samples', that.params.facets, that.params.query);

                const columns = getVisibleColumns('samples') || ['sample-id', 'sample-projects', 'sample-name', 'sample-desc'];

                that.render(response, that.params, false, columns);

                if (renderFilter) {
                    createDataTable('samples', $('#samplesTable'), $('#samplesModal'), columns);
                    that.pagination.init(1, that.params.size, Math.ceil(response.hitCount / that.params.size), response.hitCount, function (page) {
                        that.update(page);
                    });
                } else {
                    const pageObj = getPagesObj(response.hitCount, that.params.start, that.params.size);
                    that.pagination.update(pageObj, function (page) {
                        that.update(page);
                    });
                }

                $(that.el).find("button[name='download']").click(function () {
                    that.fetchCSV($(this));
                });
            }
        }).promise();
    }
});

const Run = Backbone.Model.extend({
    parse: function (d) {
        d.study_link = util.subfolder + '/studies/' + d.fields['METAGENOMICS_PROJECTS'][0];
        d.sample_link = util.subfolder + '/samples/' + d.fields['METAGENOMICS_SAMPLES'][0];
        d.run_link = util.subfolder + '/runs/' + d.id;
        d.pipeline_link = util.subfolder + '/pipelines/' + d.fields.pipeline_version[0];
        d.biomes = convertBiomes(d);
        return d;
    }
});

const Runs = Search.extend({
    tab: 'runs',
    parse: function (response) {
        response.entries = response.entries.map(Run.prototype.parse);
        return response;
    }
});

const RunsView = ResultsView.extend({
    el: '#runs',
    formEl: 'runsFilters',
    params: {},
    template: _.template($("#runsResultsTmpl").html()),
    defaultQuery: 'domain_source:metagenomics_runs',
    pagination: new Pagination(),

    setDefaultParams: function () {
        this.params = $.extend(true, {}, Search.prototype.params);
        this.params.fields += ",METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,experiment_type,pipeline_version";
        this.params.searchQuery = this.defaultQuery;
    },

    initialize: function () {
        //TODO fetch params from session storage
        this.pagination.setPaginationElem('#runs-pagination');
        const cookieParams = loadSearchParams('runs');
        this.params = $.extend(true, {}, Search.prototype.params);
        this.params.fields += ",METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,experiment_type,pipeline_version";

        if (cookieParams) {
            this.params.facets = cookieParams.filters || '';
            this.params.query = getQueryText() || cookieParams.query || this.defaultQuery;
        } else {
            this.params.query = getQueryText() || this.defaultQuery;
        }
    },

    update: function (page, pagesize) {
        var formData = processSliders(removeRedundantFilters($('#' + this.formEl).serializeArray()));
        this.params.facets = joinFilters(formData.facets || []);
        const queryText = getQueryText();
        if (queryText) {
            formData.queryParams.push(queryText);
        }
        this.params.query = formData.queryParams.join(' AND ');

        if (this.params.query === '') {
            this.params.query = this.defaultQuery;
        }

        if (pagesize) {
            this.params.size = pagesize;
        } else {
            this.params.size = getPageSize();
        }
        if (page) {
            this.params.start = parseInt(this.params.size) * (page - 1);
        } else {
            this.params.start = 0;
        }
        return this.fetchAndRender(false, false);
    },

    fetchAndRender: function (renderFilter, setFilters) {
        const that = this;

        return this.collection.fetch({
            data: $.param(this.params),
            success: function (collection, response) {
                that.totalResults = response.hitCount;
                saveSearchParams('runs', that.params.facets, that.params.query);

                const columns = getVisibleColumns('runs') || ['run-id', 'run-sample', 'run-project', 'run-experiment-type', 'run-pipeline-vers'];

                that.render(response, that.params, false, columns);

                if (renderFilter) {
                    createDataTable('runs', $('#runsTable'), $('#runsModal'), columns);
                    that.pagination.init(1, that.params.size, Math.ceil(response.hitCount / that.params.size), response.hitCount, function (page) {
                        that.update(page);
                    });
                } else {
                    const pageObj = getPagesObj(response.hitCount, that.params.start, that.params.size);
                    that.pagination.update(pageObj, function (page) {
                        that.update(page);
                    });
                }

                $(that.el).find("button[name='download']").click(function () {
                    that.fetchCSV($(this));
                });
            }
        }).promise();
    }
});

// function addClearButton($input, $container) {
//     let facet = $input.attr('name') || $input.attr('data-facet-name');
//     if (facet) {
//         facet = convertFacetLabelName(facet);
//         // Verify checkbox is checked OR
//         if ($input.is(':checked')) {
//             if (!$container.find("[data-facet='" + facet + "']").length) {
//                 const $button = $("<button data-facet='" + facet + "' class='button facet-remove-button'>" + facet + " <span class=\"icon icon-functional\" data-icon=\"x\"/></button>");
//                 $button.click(function () {
//                     resetInputsInElem($(".filters").find('.' + facet + '-group'));
//                     $container.find("[data-facet='" + facet + "']").remove();
//                     let cookie = Cookies.get(COOKIE_NAME);
//                     if (cookie){
//                         let cookieVal = JSON.parse(cookie);
//                         _.each(['projects', 'samples', 'runs'], function(facet){
//                             cookieVal[facet] = {
//                                 query: null,
//                                 filters: null
//                             }
//                         });
//                         Cookies.set(COOKIE_NAME, cookieVal);
//                     }
//                     updateAll();
//                 });
//                 $container.append($button);
//             }
//         } else {
//             // if any checkboxes on the same level are enabled
//             // if (!getFacetCheckboxes($input).is(':checked')) {
//             //     $container.find("[data-facet='" + facet + "']").remove();
//             // }
//         }
//     }
// }

window.convertFacetLabelName = convertFacetLabelName;

function convertFacetLabelName(label) {
    return label.replace(' ', '_');
}

function resetInputsInElem($elem) {
    _.each($elem.find('input:not([type="checkbox"])'), function (elem) {
        $(elem).val($(elem).attr('defaultValue')).trigger('change');
    });
    $elem.find('input[type="checkbox"]').prop('checked', false);
    $elem.find('input[type="checkbox"]').prop('indeterminate', false);
    $elem.find('.switch-input').map(sliderToggleCallback);
}

function processSliders(formData) {
    const queryNames = ['temperaturemin', 'temperaturemax', 'depthmin', 'depthmax'];
    const temp = [null, null];
    const depth = [null, null];
    _.each(formData, function (elem) {
        switch (elem.name) {
            case 'temperaturemin':
                temp[0] = elem.value;
                break;
            case 'temperaturemax':
                temp[1] = elem.value;
                break;
            case 'depthmin':
                depth[0] = elem.value;
                break;
            case 'depthmax':
                depth[1] = elem.value;
                break;
        }
    });
    let queryParams = [];

    if (temp.indexOf(null) === -1) {
        queryParams.push('temperature:[' + temp[0] + ' TO ' + temp[1] + ']');
    }
    if (depth.indexOf(null) === -1) {
        queryParams.push('depth:[ ' + depth[0] + ' TO ' + depth[1] + ']');
    }
    return {
        facets: formData.filter(function (elem) {
            return (queryNames.indexOf(elem.name) === -1);
        }),
        queryParams: queryParams,
    }
}

function joinFilters(filters) {
    return filters.map(function (elem) {
        return elem.name + ":" + elem.value;
    }).join(',')
}

function removeRedundantFilters(formData) {
    // var newData = formData.filter(function (elem) {
    //     return elem.name !== 'biome';
    // });
    // var biomes = formData.filter(function (elem) {
    //     return elem.name === 'biome';
    // });
    let newData = [];
    _.each(formData, function (biome) {
        let parent = null;
        let biomeValue = biome.value;
        if (biomeValue.indexOf('/') > -1) {
            var pos = biomeValue.lastIndexOf('/');
            parent = biomeValue.substring(0, pos);
        } else {
            parent = '';
        }
        var parentExists = _.find(formData, function (biome2) {
            return biome2.value === parent
        });

        if (!parentExists) {
            newData.push(biome);
        }
    });
    return newData;
}

function convertBiomes(entry) {
    let biomes = [];
    _.each(entry.fields.biome, function (biome) {
        biome = 'root:' + biome.replace(/\/([^\/]*)$/, '').replace(/\//g, ':');
        biomes.push({
            name: util.formatLineage(biome),
            icon: util.getBiomeIcon(biome)
        });
    });
    return biomes;
}

function setFacetFilters(formId, formData) {
    if (formData.facets) {
        let facetParams = formData.facets.split(",");
        _.each(facetParams, function (param) {
            let [name, value] = param.split(":");
            // Set checkbox parent and propagate to parent
            const selector = formId + " input[name='" + name + "'][value='" + value + "']";
            $(selector).prop('checked', true).parent().show();
        });
    }
    let setSliders = [];
    //TODO slider setting
    if (formData.query) {
        const facets = formData.query.split(" AND ");
        const $form = $(formId);
        _.each(facets, function (facet) {
            const data = SLIDER_PARAM_RE.exec(facet);
            if (data && data.length === 4) {
                const facetName = data[1];
                setSliders.push(facetName);
                const valueMin = data[2];
                const valueMax = data[3];
                $form.find('[name=' + facetName + 'min]').val(valueMin).prop('disabled', false);
                $form.find('[name=' + facetName + 'max]').val(valueMax).prop('disabled', false);
                $form.find('.slider[data-facet-slider=' + facetName + ']').slider({
                    values: [valueMin, valueMax],
                    disabled: false
                });
                $form.find('.switch-input[data-facet-name=' + facetName + ']').prop('checked', true);
            }
        });
    }
    _.each(['temperature', 'depth'], function (facetName) {
        $(formId).find('.' + facetName + '-group').find('input.switch-input').each(function () {
            const enabled = setSliders.indexOf(facetName) > -1;
            $(this).prop('checked', enabled);
            enableSlider($(this), enabled, false);
            // addClearButton($(this), $('.filter-clear'));
        });
    });
}

function isFacetParam(elem) {
    const res = SLIDER_PARAM_RE.exec(elem);
    return res !== null && res.length === 4;
}

function sliderToggleCallback(e) {
    const $checkbox = $(this);
    const enabled = $checkbox.is(':checked');
    enableSlider($checkbox, enabled);
    const formId = $(this).closest('form').attr('id');
    if (e && e.originalEvent && e.originalEvent.isTrusted) {
        const groupClass = '.' + $(this).parent().parent().attr('class').replace(' ', '.');
        _.map(getAllFormIds(formId), function (otherFacetForm) {
            const $checkbox = $(otherFacetForm).find(groupClass).find('input.switch-input');
            $checkbox.prop('checked', enabled);
            enableSlider($checkbox, enabled);
        });
        addClearButton($(this), $('.filter-clear'));
        updateAll();
    }
}

function enableSlider($checkbox, enabled) {
    const $parent = $checkbox.parent();
    const $elemGroup = $parent.siblings('.slider-group');
    if (enabled) {
        $elemGroup.removeClass('disabled');
        $elemGroup.find('.slider').slider('enable');
    } else {
        $elemGroup.addClass('disabled');
        $elemGroup.find('.slider').slider('disable');
    }
    $elemGroup.find(':input').prop('disabled', !enabled);
}

function updateAll(pagesize) {
    showSpinner();
    return $.when(
        projectsView.update(null, pagesize),
        samplesView.update(null, pagesize),
        runsView.update(null, pagesize)
    ).done(function () {
        hideSpinner();
    });
}

function showSpinner() {
    $('#loading-icon').fadeIn();
}

function hideSpinner() {
    $('#loading-icon').fadeOut();
}

function getAllFormIds(except) {
    return _.filter([
        '#' + projectsView.formEl,
        '#' + samplesView.formEl,
        '#' + runsView.formEl
    ], function (e) {
        return e !== except;
    })
}

function resetAllForms() {
    $(".facet-remove-button").remove();
    _.each(getAllFormIds(), function (id) {
        const $form = $(id);
        resetInputsInElem($form);
    });
    projectsView.initialize();
    samplesView.initialize();
    runsView.initialize();

    initAll(projectsView, samplesView, runsView, false, false);
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

const button = $("<button id='search-reset' class='button' type='reset'>Clear all</button>");
const $searchForm = $("#headerSearchForm");
$searchForm.append(button);
$searchForm.on('reset', function () {
    Cookies.remove(COOKIE_NAME);
    window.location.href = 'search';

});

function getQueryText() {
    return $searchForm.find("#navbar-query").val();
}

function initAll(projectsView, samplesView, runsView, renderFilters, setFilters) {
    showSpinner();
    const projectFacet = $.get(searchUrl + "projects?format=json&size=1&start=0&facetcount=10&facetsdepth=3&query=domain_source%3Ametagenomics_projects");
    const sampleFacet = $.get(searchUrl + "samples?format=json&size=1&start=0&facetcount=10&facetsdepth=3&query=domain_source%3Ametagenomics_samples");
    const runFacet = $.get(searchUrl + "runs?format=json&size=1&start=0&facetcount=10&facetsdepth=3&query=domain_source%3Ametagenomics_runs");
    return $.when(
        projectsView.fetchAndRender(renderFilters, setFilters),
        samplesView.fetchAndRender(renderFilters, setFilters),
        runsView.fetchAndRender(renderFilters, setFilters),
        projectFacet,
        sampleFacet,
        runFacet
    ).done(function () {
        hideSpinner();
        createCheckboxTrees('projects', projectFacet.responseJSON.facets, projectsView, $('#projectsFilters'), $('#projects-search-params'), projectsView.update.bind(projectsView));
        setFacetFilters('#projectsFilters', projectsView.params);

        const $samplesForm = $('#samplesFilters');
        const $sampleBtnContainer = $('#samples-search-params');
        createSliders($samplesForm, 'samples', samplesView.update.bind(samplesView), $sampleBtnContainer);
        createCheckboxTrees('samples', sampleFacet.responseJSON.facets, samplesView, $samplesForm, $sampleBtnContainer, samplesView.update.bind(samplesView));
        setFacetFilters('#samplesFilters', samplesView.params);

        const $runsForm = $('#runsFilters');
        const $runsBtnContainer = $('#runs-search-params');
        createSliders($runsForm, 'runs', runsView.update.bind(runsView), $runsBtnContainer);
        createCheckboxTrees('runs', runFacet.responseJSON.facets, runsView, $runsForm, $runsBtnContainer, runsView.update.bind(runsView));
        setFacetFilters('#runsFilters', runsView.params);

    });
}

function createDataTable(facet, $table, $modal, initColumns) {
    function setColumnVisibility(visible, data_column) {
        const tds = $table.find("td[data-column='" + data_column + "']");
        if (visible) {
            tds.show();
        } else {
            tds.hide();
        }
    }

    function addModalCheckbox($modal, text, label, checked) {
        setColumnVisibility(checked, label);

        const $checkbox = $("<input data-column='" + label + "' type='checkbox' />");
        $checkbox.prop('checked', checked);

        const $label = $("<label for='" + label + "'>" + text + "</label>");
        const $container = $("<div class='row column'></div>");
        $checkbox.click(function (e) {
            setColumnVisibility($(this).is(":checked"), $(this).attr('data-column'));

            const visibleColumns = [];
            $modal.find('input[type=checkbox]:checked').each(function () {
                visibleColumns.push($(this).attr('data-column'));
            });
            saveVisibleColumns(facet, visibleColumns);
        });

        $container.append($label).append($checkbox);
        $modal.append($container);
    }

    _.each($table.find('thead').find('td'), function (column) {
        const text = $(column).attr('data-column');
        const visible = initColumns.indexOf(text) !== -1;
        addModalCheckbox($modal, $(column).text(), $(column).attr('data-column'), visible);
    })
}

function createSliders($form, facet, callback, $btnContainer) {
    new Slider().init($form, facet, 'Temperature', 'temperature', -20, 110, '°C', callback, $btnContainer);
    new Slider().init($form, facet, 'Depth', 'depth', 0, 2000, 'meters', callback, $btnContainer);
}

function createCheckboxTrees(facet, trees, facetView, $facetForm, $facetBtnContainer, callback) {
    let values = null;
    if (facetView.params.facets) {
        values = _.map(facetView.params.facets.split(","), function (facet) {
            const p = facet.split(":");
            return {
                id: p[0],
                value: p[1]
            }
        });
    } else {
        values = [];
    }

    _.each(trees, function (tree) {
        if (tree.id !== 'domain_source') {
            const cbTree = new CheckboxTree().init(facet, $facetForm, $facetBtnContainer, tree, callback, values, false);
        }
    });
}

function saveSearchParams(facet, filters, query) {
    let cookieParams = Cookies.get(COOKIE_NAME);
    if (cookieParams === undefined) {
        cookieParams = {};
        cookieParams[facet] = {};
    } else {
        cookieParams = JSON.parse(cookieParams);
        if (cookieParams[facet] === undefined) {
            cookieParams[facet] = {};
        }
    }
    if (filters) {
        cookieParams[facet]['filters'] = filters;
    } else {
        delete cookieParams[facet]['filters'];
    }
    if (query) {
        cookieParams[facet]['query'] = query;
    } else {
        delete cookieParams[facet]['query'];
    }

    Cookies.set(COOKIE_NAME, cookieParams);
}

function loadSearchParams(facet) {
    let data, query = null;
    let cookie = Cookies.get(COOKIE_NAME);
    if (cookie) {
        cookie = JSON.parse(cookie);
        try {
            data = cookie[facet]['filters'];
        } catch (e) {
            data = null;
        }

        try {
            query = cookie[facet]['query'];
        } catch (e) {
            query = null;
        }
    }
    return {
        filters: data,
        query: query
    };
}

function deleteCachedSearchParams() {
    let cookie = Cookies.get(COOKIE_NAME);
    if (cookie) {
        let cookieVal = JSON.parse(cookie);
        _.each(['projects', 'samples', 'runs'], function (facet) {
            cookieVal[facet] = {
                query: null,
                filters: null
            }
        });
        Cookies.set(COOKIE_NAME, cookieVal);
    }
    const new_url = window.location.toString();
}

window.getVisibleColumns = getVisibleColumns;

function getVisibleColumns(facet) {
    let cookieData = Cookies.get(COOKIE_NAME);
    if (cookieData) {
        cookieData = JSON.parse(cookieData);
        if (cookieData[facet]) {
            return cookieData[facet]['columns']
        }
    }
    return null
}

function saveVisibleColumns(facet, columns) {
    let cookieData = Cookies.get(COOKIE_NAME);
    if (cookieData) {
        cookieData = JSON.parse(cookieData);
    } else {
        cookieData = {}
    }
    if (cookieData[facet]) {
        cookieData[facet] = {
            columns: columns,
            data: cookieData[facet]['data']
        }
    } else {
        cookieData[facet] = {
            columns: columns,
        }
    }
    Cookies.set(COOKIE_NAME, cookieData);
}

function insertEbiSearchText() {
    const html = '<p><small class="text-muted">Powered by <a href="https://www.ebi.ac.uk/ebisearch/&quot;" class="ext" target="_blank">EBI Search</a></small></p>';
    $('.ebi-search').html(html);
}

insertEbiSearchText();

let search = new Search();

let projects = new Projects();
let projectsView = new ProjectsView({collection: projects});

let samples = new Samples();
let samplesView = new SamplesView({collection: samples});

let runs = new Runs();
let runsView = new RunsView({collection: runs});

let filters = new FiltersView(updateAll);

initAll(projectsView, samplesView, runsView, true, true);
