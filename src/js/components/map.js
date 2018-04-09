const Handlebars = require('handlebars');
const _ = require('underscore');


module.exports = class Map {
    constructor(elementId, samples, displayMarkerDetails) {
        let map = new google.maps.Map(document.getElementById(elementId), {
            streetViewControl: false,
            zoom: 1,
            center: new google.maps.LatLng(0.0, 0.0)
        });

        const template = require('../../partials/map_marker.handlebars');

        let oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true
        });

        // // Do not display markers with invalid Lat/Long values
        const that = this;
        let markers = samples.reduce(function(result, sample) {
            const lat = sample.latitude;
            const lng = sample.longitude;

            if ((lat !== null) && (lng !== null)) {
                result.push(that.placeMarker(map, oms, template, sample, displayMarkerDetails));
            }
            return result;
        }, []);

        if (markers.length > 1) {
            let bounds = new google.maps.LatLngBounds();
            for (let i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }

            let markerCluster = new MarkerClusterer(map, markers,
                {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    maxZoom: 17
                });
        } else if (markers.length === 0) {
            const $parentDiv = $('#'+elementId).parent();
            $('#'+elementId).addClass('disabled');
            $parentDiv.addClass('no-coords-tooltip');
            $('.map > span.hidden').removeClass('hidden');
        }
        window.map = map;
        return map;
    }

    getSamplePosition(sample) {
        return {lat: parseFloat(sample.latitude), lng: parseFloat(sample.longitude)};
    }

    createMarkerLabel(template, sample) {
        return template(sample);
    }

    placeMarker(map, oms, template, sample, displayMarkerDetails) {
        const pos = this.getSamplePosition(sample);

        let marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: sample.id
        });

        let contentString = template(sample);
        if (displayMarkerDetails) {
            let infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(marker, 'spider_click', function(e) {
                infowindow.open(map, marker);
            });
        }
        oms.addMarker(marker);
        return marker;
    }
};

