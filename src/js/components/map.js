const Handlebars = require('handlebars');

module.exports = class Map {
    constructor(elementId, samples) {
        let map = new google.maps.Map(document.getElementById(elementId), {
            streetViewControl: false,
            zoom: 1,
            center: new google.maps.LatLng(0.0, 0.0)
        });

        const template = Handlebars.compile($("#marker-template").html());

        let oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true
        });

        // // Do not display markers with invalid Lat/Long values
        const that = this;
        let markers = samples.reduce(function (result, sample) {
            const lat = sample.attributes.latitude;
            const lng = sample.attributes.longitude;

            if (lat === null || lng === null) {
                $("#warning").show();
            } else {
                result.push(that.placeMarker(map, oms, template, sample));
            }
            return result;
        }, []);

        if (markers.length > 1) {
            let bounds = new google.maps.LatLngBounds();
            for (let i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }
            // map.fitBounds(bounds);

            let markerCluster = new MarkerClusterer(map, markers,
                {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    maxZoom: 17
                });
        }
        window.map = map;
        return map
    };

    getSamplePosition(sample) {
        return {lat: parseFloat(sample.attributes.latitude), lng: parseFloat(sample.attributes.longitude)}
    };

    createMarkerLabel(template, sample) {
        const attr = sample.attributes;
        let data = {
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
    };

    placeMarker(map, oms, template, sample) {
        const pos = this.getSamplePosition(sample);

        let marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: sample.id
        });


        let contentString = this.createMarkerLabel(template, sample);

        let infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        google.maps.event.addListener(marker, 'spider_click', function (e) {
            infowindow.open(map, marker);
        });
        oms.addMarker(marker);
        // marker.addListener('click', function () {
        // });
        return marker;
    };

};

