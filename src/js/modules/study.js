const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const Handlebars = require('handlebars');
const List = require('list.js');

const pagination = new Pagination();

// const OverlappingMarkerSpiderfier = require('../../../static/libraries/oms.min.js');
import 'js-marker-clusterer';

import {DEFAULT_PAGE_SIZE} from "../config";
import {
    attachTabHandlers,
    getURLFilterParams,
    getURLParameter,
    hideTableLoadingGif,
    initTableTools,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif
} from "../util";

setCurrentTab('#studies-nav');

var study_id = getURLParameter();

const pageFilters = getURLFilterParams();
let runsView = null;

var StudyView = Backbone.View.extend({
    model: api.Study,
    template: _.template($("#studyTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: $.param({include: 'samples'}), success: function (data, response) {
                that.render();
                attachTabHandlers();
                initTableTools();
                const collection = new api.RunCollection({study_id: study_id});
                runsView = new RunsView({collection: collection});
                initMap(data.attributes.samples);
                $("#pagination").append(commons.pagination);
                $("#pageSize").append(commons.pagesize);
                pagination.setPageSizeChangeCallback(updatePageSize);
            }
        });
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

var RunView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#runRow").html()),
    attributes: {
        class: 'run-row',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

var RunsView = Backbone.View.extend({
    el: '#runsTableBody',
    initialize: function () {
        var that = this;

        let params = {};
        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        if (pagesize !== null) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;

        params.include = 'sample';
        params.study_accession = study_id;
        this.collection.fetch({
            data: $.param(params), success: function (collection, response, options) {
                const pag = response.meta.pagination;
                pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                that.render();
                createLiveFilter();
            }
        });
        return this;
    },
    update: function (page, page_size) {
        $(".run-row").remove();
        showTableLoadingGif();
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        params.include = 'sample';
        params.study_accession = study_id;

        setURLParams(params, false);

        this.collection.fetch({
            data: $.param(params), remove: true,
            success: function (collection, response, options) {
                hideTableLoadingGif();
                pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });

    },
    render: function () {
        this.collection.each(function (run) {
            console.log(run);
            var runView = new RunView({model: run});
            $(this.$el).append(runView.render());
        }, this);
        let opts = {
            valueNames: ["sample_name", "sample_id", "run_id", "experiment_type", "instrument_platform", "instrument_model"]
        };
        window.a = new List("runs-section", opts);
        return this;
    }
});

function createLiveFilter() {
    // $('#runsTableBody').liveFilter(
    //     '#search-filter', 'tr'
    // );
}


function updatePageSize(pageSize) {
    runsView.update(pagination.currentPage, pageSize);
}

function changePage(page) {
    runsView.update(page, pagination.getPageSize());
}

function initMap(samples) {
    var map = new google.maps.Map(document.getElementById('map'), {
        streetViewControl: false,
    });

    const template = Handlebars.compile($("#marker-template").html());

    var oms = new OverlappingMarkerSpiderfier(map, {
        markersWontMove: true,
        markersWontHide: true,
        basicFormatEvents: true
    });

    // Do not display markers with invalid Lat/Long values
    let markers = samples.reduce(function (result, sample) {
        const lat = sample.attributes.latitude;
        const lng = sample.attributes.longitude;
        if (!(lat === null || lng === null)) {
            result.push(placeMarker(map, oms, template, sample));
        } else {
            $("#warning").show();
        }
        return result;
    }, []);

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    map.fitBounds(bounds);

    var markerCluster = new MarkerClusterer(map, markers,
        {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            maxZoom: 17
        });
    window.map = map;
    return map
}

function getSamplePosition(sample) {
    return {lat: parseFloat(sample.attributes.latitude), lng: parseFloat(sample.attributes.longitude)}
}

function createMarkerLabel(template, sample) {
    const attr = sample.attributes;
    var data = {
        id: attr.accession,
        name: attr['sample-name'],
        desc: attr['sample-desc'],
        classification: attr['environment-biome'],
        collection_date: attr['collection-date'],
        lat: attr['latitude'],
        lng: attr['longitude'],
        sample_url: '/sample/' + attr.accession
    };
    return template(data);
}

function placeMarker(map, oms, template, sample) {
    const pos = getSamplePosition(sample);

    var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: sample.id
    });


    var contentString = createMarkerLabel(template, sample);

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    google.maps.event.addListener(marker, 'spider_click', function (e) {
        infowindow.open(map, marker);
    });
    oms.addMarker(marker);
    // marker.addListener('click', function () {
    // });
    return marker;
}

var study = new api.Study({id: study_id});
var studyView = new StudyView({model: study});
