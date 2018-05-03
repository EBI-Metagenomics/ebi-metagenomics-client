module.exports = class MapHandler {
    /**
     * Create a new instance of a google map in the element with id
     * @param {string} elementId
     * @param {[object]} samples
     * @param {boolean} displayMarkerDetails
     */
    constructor(elementId, samples, displayMarkerDetails) {
        let map = new google.maps.Map(document.getElementById(elementId), {
            streetViewControl: false,
            zoom: 1,
            center: new google.maps.LatLng(0.0, 0.0)
        });

        const template = require('../../partials/map_marker.handlebars');

        // // Do not display markers with invalid Lat/Long values
        const that = this;
        let markers = samples.reduce(function(result, sample) {
            const lat = sample.latitude;
            const lng = sample.longitude;

            if ((lat !== null) && (lng !== null)) {
                result.push(that.placeMarker(map, template, sample, displayMarkerDetails));
            }
            return result;
        }, []);
        const $map = $('#' + elementId);
        if (markers.length > 1) {
            $map.siblings('.no-coords-span').hide();
            let bounds = new google.maps.LatLngBounds();
            for (let i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }

            // new MarkerClusterer(map, markers, {
            //     imagePath: 'https://developers.google.com/maps/documentation/' +
            //     'javascript/examples/markerclusterer/m',
            //     maxZoom: 17
            // });
        } else if (markers.length === 0) {
            const $parentDiv = $map.parent();
            $map.addClass('disabled');

            $parentDiv.hover(function() {
                    $map.siblings('.no-coords-span').css('display', 'block');
                }, function() {
                    $map.siblings('.no-coords-span').css('display', 'none');
                }
            );
        }
        window.map = map;
        return map;
    }

    /**
     * Return sample coordinates from sample obj
     * @param {object} sample
     * @return {{lat: Number, lng: Number}}
     */
    getSamplePosition(sample) {
        return {lat: parseFloat(sample.latitude), lng: parseFloat(sample.longitude)};
    }

    /**
     * Create marker from sample obj
     * @param {object} template
     * @param {object} sample
     * @return {JQuery.HTMLElement}
     */
    createMarkerLabel(template, sample) {
        return template(sample);
    }

    /**
     * Places a marker on the map
     * @param {object} map
     * @param {object} template
     * @param {object} sample
     * @param {boolean} displayMarkerDetails
     * @return {google.maps.Marker}
     */
    placeMarker(map, template, sample, displayMarkerDetails) {
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

            google.maps.event.addListener(marker, 'spider_click', function() {
                infowindow.open(map, marker);
            });
        }
        return marker;
    }
};

