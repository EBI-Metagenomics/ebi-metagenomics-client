const _ = require('underscore');
const Backbone = require('backbone');
const { Loader } = require("@googlemaps/js-api-loader");
const api = require('mgnify').api(process.env.API_URL);
const MarkerClusterer = require('@googlemaps/markerclustererplus').default;

const util = require('../util');

const sampleMarkerTpl = require("../../templates/samplesMaps/sampleMarker.html");
const samplesClusterListTpl = require("../../templates/samplesMaps/samplesClusterList.html");
const foreLoadTpl = require("../../templates/samplesMaps/forceLoad.html");

const { GMAPS_API_KEY } = require("../commons");

/**
 * Google Maps Sample Pop View
 */
const SamplePopUpView = Backbone.View.extend({

    template: sampleMarkerTpl,

    initialize(sample) {
        this.sample = sample;
    },

    render() {
        this.$el.html(
            this.template({ 'sample': this.sample })
        );
        return this;
    }

});

/**
 * Google Maps view for Samples.
 * This View supports loading the samples from a Study (provide the model when creating the class)
 * or loading the samples using setSamples and then calling render.
 */
export const SamplesMapView = Backbone.View.extend({

    el: 'div#map-container',

    events: {
        'click  #map-force-load': 'forceRender'
    },

    /**
     * Create a new instance of a google map in the element with id
     * @param {[object]} Properties: study (optional), samples (optional), zoom (default 4)
     */
    initialize(options) {
        options = options || {};
        this.study = options.study || {};
        this.samples = options.samples || [];
        this.zoom = options.zoom || 4;
        
        // Studies with more than 1000 samples
        // won't be loaded, unless the user force it
        this.tooManyToLoad = false;
        if (!_.isEmpty(this.study)) {
            this.tooManyToLoad = this.study.get('samples_count') >= 1000;
        }

        this.markerSamples = {};
    },

    /**
     * Set the map samples. Use this method to avoid callind get study collection API
     * @param {[SampleModel]} samples 
     */
    setSamples(samples) {
        this.samples = samples;
    },

    /**
     * Turn on or off the loading spinner
     * @param {boolean} toggle 
     */
    toggleLoading(toggle) {
        $('.map-spinner').toggle(toggle);
    },

    /**
     * Get the samples from the API (this is recursive and 
     * could take a few minutes to finish)
     * The API won't be called if the user used setSamples to load
     * the samples in the View.
     * @returns promise
     */
    fetchSamples() {
        const that = this;
        const deferred = $.Deferred();

        // data loaded, using setSamples
        if (that.samples.length > 0) {
            deferred.resolve();
            return deferred.promise();
        }

        let samplesCollection = new api.SamplesCollection();

        const fetchPage = (url) => {
            const studyAccession = that.study.get("study_accession");
            
            if (_.isString(url)) {
                samplesCollection.url = url;
            }

            let fetchHandler = {
                success(response, meta) {
                    let data = response.models;
                    that.samples = that.samples.concat(data);
                    deferred.notify(data.length);
                    if (_.isString(meta.links.next)) {
                        fetchPage(meta.links.next);
                    } else {
                        deferred.resolve();
                    }
                }
            }

            // Prevent adding the filter again, for next/prev pages links
            // the study accession is already included
            if (samplesCollection.url.indexOf(studyAccession) === -1) {
                fetchHandler.data = $.param({ study_accession: studyAccession })
            }

            samplesCollection.fetch(fetchHandler);
        }

        // start the download cascade
        fetchPage();

        return deferred.promise();
    },

    /**
     * In case the user want to force load the study samples.
     */
    forceRender() {
        this.tooManyToLoad = false;
        return this.render();
    },

    /**
     * Render
     */
    render() {
        const self = this;

        if (self.tooManyToLoad) {
            // render force button
            this.$el.prepend(
                foreLoadTpl({
                    "count": self.study.get("samples_count")
                })
            );
            return this;
        }

        this.$(".force-load").remove();
        this.toggleLoading(true);

        let loadingCounter = 0;

        self.fetchSamples().then(
            () => {
                if (_.isEmpty(this.samples)) {
                    return this.renderPlaceHolder().noSamples();
                }

                const samplesFiltered = _.filter(this.samples, sample => {
                    if (sample.has('longitude') && sample.has('latitude')) {
                        return sample.get('longitude') !== 0.0 && sample.get('latitude') !== 0.0;
                    }
                    return false;
                });

                if (_.isEmpty(samplesFiltered)) {
                    return this.renderPlaceHolder().noSamples();
                }

                let maxLng = undefined;
                let minLng = undefined;
                let maxLat = undefined;
                let minLat = undefined;
                _.each(samplesFiltered, sample => {
                    const lng = sample.get('longitude');
                    if (lng > maxLng || _.isUndefined(maxLng)) {
                        maxLng = lng;
                    }
                    if (lng < minLng || _.isUndefined(minLng)) {
                        minLng = lng;
                    }

                    const lat = sample.get('latitude');
                    if (lat > maxLat || _.isUndefined(maxLat)) {
                        maxLat = lat;
                    }
                    if (lat < minLat || _.isUndefined(minLat)) {
                        minLat = lat;
                    }
                });

                const loader = new Loader({
                    apiKey: GMAPS_API_KEY,
                    version: 'weekly',
                });

                loader.load().then(() => {

                    const map = new google.maps.Map(document.getElementById('map'), {
                        zoom: self.zoom,
                        maxZoom: 18,
                        center: {
                            lat: (maxLat + minLat) / 2.0,
                            lng: (maxLng + minLng) / 2.0,
                        }
                    });

                    const sampleInfoWindow = new google.maps.InfoWindow();
                    const markers = [];

                    _.each(samplesFiltered, sample => {
                        const marker = new google.maps.Marker({
                            position: {
                                lng: sample.get('longitude'),
                                lat: sample.get('latitude')
                            },
                            map: map,
                        });
                        marker.addListener('click', () => {
                            sampleInfoWindow.setContent(
                                new SamplePopUpView(sample).render().el
                            );
                            sampleInfoWindow.open(map, marker);
                        });
                        markers.push(marker);
                        // keep track of the samples per position
                        self.registerMarker(sample, marker);
                    });

                    const clusterInfoWindow = new google.maps.InfoWindow();
                    const markerCluster = new MarkerClusterer(map, markers, {
                        imagePath: util.subfolder + '/static/images/maps/m',
                        maxZoom: 18
                    });

                    // for clusters in MAX Zoom and with less than 10 elements show a list
                    google.maps.event.addListener(markerCluster, 'click', function (cluster) {
                        if (this.prevZoom_ + 1 <= this.getMaxZoom() || cluster.getSize() >= 10) {
                            return;
                        }
                        clusterInfoWindow.setPosition(cluster.getCenter());

                        // using the first marker as all the cluster marker
                        // at this level of zoom share the same ~coordinates
                        const firstMarker = _.first(cluster.getMarkers());
                        const clusterSamples = self.retrieveSamplesForMarker(firstMarker);

                        clusterInfoWindow.setContent(
                            samplesClusterListTpl({ 'samples': clusterSamples })
                        );
                        clusterInfoWindow.open(map);
                    });
                }).catch(reason => {
                    console.error("Error loading the map");
                    console.error(reason);
                    self.renderPlaceHolder("Error loading the map.");
                }).finally(() => {
                    self.$(".samples-counter").remove();
                    this.toggleLoading(false);
                })
            }
            , (error) => {
                console.error(error);
                this.renderPlaceHolder("There was an error loading the samples");
                this.toggleLoading(false);
            }, (count) => {
                loadingCounter += count;
                self.$(".samples-counter").html(
                    "Loading " + loadingCounter + " of " + self.study.get("samples_count") + " samples"
                );
            })

        return this;
    },

    /**
     * Render a place holder with the supplied message
     * @param {string} message Message
     */
    renderPlaceHolder(message) {
        let defaultMessage = "This study was submitted without geolocation co-ordinates";
        if (_.isEmpty(this.study)) {
            defaultMessage = "This sample was submitted without geolocation co-ordinates";
        }
        message = message || defaultMessage;
        this.$el.html(
            "<div class='callout warning text-center' style='margin-bottom: 0'>" +
            "<p>" + message + "</p>" +
            "</div>"
        );
        this.$el.removeClass();
        this.$el.addClass("columns");
        return this;
    },

    /**
     * Trigger events an clean when there are no samples.
     */
    noSamples() {
        this.trigger("samples-map:no-samples");
        this.toggleLoading(false);
    },

    /**
     * Register the marker in the samples/marker mapping.
    */
    registerMarker(sample, marker) {
        const key = marker.getPosition().lat().toString() +
            marker.getPosition().lng().toString();

        if (key in this.markerSamples) {
            this.markerSamples[key].push(sample);
        } else {
            this.markerSamples[key] = [sample];
        }
        return this;
    },

    /**
     * Retrieve the samples for a marker
    */
    retrieveSamplesForMarker(marker) {
        const key = marker.getPosition().lat().toString() +
            marker.getPosition().lng().toString();
        return this.markerSamples[key];
    },
});
