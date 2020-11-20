const _ = require('underscore');
const Backbone = require('backbone');
const { Loader } = require("@googlemaps/js-api-loader");
import MarkerClusterer from '@googlemaps/markerclustererplus';

const util = require('../util');

const sampleMarkerTpl = require("../../templates/googleMaps/sampleMarker.html");
const samplesClusterListTpl = require("../../templates/googleMaps/samplesClusterList.html");

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

export const MapView = Backbone.View.extend({

    el: 'div#map-container',

    /**
     * Create a new instance of a google map in the element with id
     * @param {[object]} samples samples add tooltips to markers
     */
    initialize(options) {
        options = options || {};
        this.samples = options.samples || [];
        this.zoom = options.zoom || 4;
        this.markerSamples = {};
    },

    /**
     * Set the map samples
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
     * Render
     */
    render() {
        const self = this;

        if (_.isEmpty(this.samples)) {
            return this.renderPlaceHolder("This study was submitted without geolocation co-ordinates");
        }

        const samplesFiltered = _.filter(this.samples, sample => {
            return sample.has('longitude') && sample.has('latitude');
        });

        if (_.isEmpty(samplesFiltered)) {
            return this.renderPlaceHolder("This study was submitted without geolocation co-ordinates");
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

        this.toggleLoading(true);

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

            // for clusters in MAX Zoom and with less than 10 elements show a lis
            google.maps.event.addListener(markerCluster, 'click', function (cluster) {
                if (this.prevZoom_ + 1 <= this.getMaxZoom() || cluster.getSize() >= 10) {
                    return;
                }
                clusterInfoWindow.setPosition(cluster.getCenter());

                // using the first marker as all the cluster makers at this level of
                // zoom share the same coordinates
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
            this.toggleLoading(false);
        })

        return this;
    },

    /**
     * Render a place holder with the supplied message
     * @param {string} message Message
     */
    renderPlaceHolder(message) {
        // TODO: remove this inline style
        this.$el.html(
            "<div class='callout warning text-center' style='margin-bottom: 0'>" +
            "<p>" + message + "</p>" +
            "</div>"
        );
        this.$el.removeClass();
        this.$el.addClass('columns');
        this.toggleLoading(false);
        this.trigger('map:no-samples');
        return this;
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
