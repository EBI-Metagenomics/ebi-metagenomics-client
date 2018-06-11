const d3 = require('d3');
const _ = require('underscore');
const template = require('../../partials/map_tooltip.handlebars');
const api = require('mgnify').api;
const subfolder = require('../util').subfolder;

/**
 * Return sample coordinates from sample obj
 * @param {object} sample
 * @return {{lat: Number, lng: Number}}
 */
function getSamplePosition(sample) {
    return {
        'lat': parseFloat(sample.latitude),
        'lng': parseFloat(sample.longitude),
        'count': sample['samples-count'],
        'uuid-samples': _.uniqueId('marker-tooltip-list'),
        'uuid-loading-icon': _.uniqueId('loading-icon'),
        'subfolder': subfolder
    };
}

let generateIconCache = {};

/**
 * Generate marker icons
 * @param {number} number of samples at coordinates
 * @param {function} callback to use
 */
function generateIcon(number, callback) {
    if (generateIconCache[number] !== undefined) {
        callback(generateIconCache[number]);
    }

    let fontSize = 16;
    let imageWidth = 35;
    let imageHeight = 35;

    if (number >= 1000) {
        fontSize = 10;
        imageWidth = 55;
        imageHeight = 55;
    } else if (number < 1000 && number > 100) {
        fontSize = 14;
        imageWidth = 45;
        imageHeight = 45;
    }

    let svg = d3.select(document.createElement('div')).append('svg')
        .attr('viewBox', '0 0 54.4 54.4')
        .append('g');

    svg.append('circle')
        .attr('cx', '27.2')
        .attr('cy', '27.2')
        .attr('r', '21.2')
        .style('fill', '#2063C6');

    svg.append('path')
        .attr('d',
            'M27.2,0C12.2,0,0,12.2,0,27.2s12.2,27.2,27.2,27.2s27.2-12.2,' +
            '27.2-27.2S42.2,0,27.2,0z M6,27.2 C6,15.5,15.5,6,27.2,6s21.2,' +
            '9.5,21.2,21.2c0,11.7-9.5,21.2-21.2,21.2S6,38.9,6,27.2z')
        .attr('fill', '#FFFFFF');

    svg.append('text')
        .attr('dx', 27)
        .attr('dy', 32)
        .attr('text-anchor', 'middle')
        .attr('style', 'font-size:' + fontSize +
            'px; fill: #FFFFFF; font-family: Arial, Verdana; font-weight: bold')
        .text(number);

    let svgNode = svg.node().parentNode.cloneNode(true);
    let image = new Image();

    d3.select(svgNode).select('clippath').remove();

    let xmlSource = (new XMLSerializer()).serializeToString(svgNode);

    image.onload = (function(imageWidth, imageHeight) {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let dataURL;

        d3.select(canvas)
            .attr('width', imageWidth)
            .attr('height', imageHeight);

        context.drawImage(image, 0, 0, imageWidth, imageHeight);

        dataURL = canvas.toDataURL();
        generateIconCache[number] = dataURL;

        callback(dataURL);
    }).bind(this, imageWidth, imageHeight);

    image.src = 'data:image/svg+xml;base64,' +
        btoa(encodeURIComponent(xmlSource).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

/**
 * Add sample to tooltip list
 * @param {jQuery.HTMLElement} listObj jQuery handler for list of samples
 * @param {object} sample data
 */
function addSampleToList(listObj, sample) {
    listObj.append('<li><a href="'+sample.sample_url+'">'+sample.sample_accession+'</a></li>');
}

module.exports = class MapHandler {
    /**
     * Create a new instance of a google map in the element with id
     * @param {string} elementId
     * @param {[object]} samples
     * @param {boolean} enableTooltips if true add tooltips to markers
     * @param {string} studyAccession
     */
    constructor(elementId, samples, enableTooltips, studyAccession) {
        let map = new google.maps.Map(document.getElementById(elementId), {
            streetViewControl: false,
            zoom: 1,
            center: new google.maps.LatLng(0.0, 0.0)
        });

        // // Do not display markers with invalid Lat/Long values
        const that = this;
        let markers = samples.reduce(function(result, sample) {
            const lat = sample.latitude;
            const lng = sample.longitude;
            if ((lat !== null) && (lng !== null)) {
                result.push(that.placeMarker(map, sample, enableTooltips, studyAccession));
            }
            return result;
        }, []);
        const $map = $('#' + elementId);
        if (markers.length > 1) {
            // $map.siblings('.no-coords-span').hide();
            // let bounds = new google.maps.LatLngBounds();
            // for (let i = 0; i < markers.length; i++) {
            //     bounds.extend(markers[i].getPosition());
            // }
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
     * Places a marker on the map
     * @param {object} map
     * @param {object} coords
     * @param {boolean} enableTooltips if true add tooltips to markers
     * @param {string} studyAccession
     */
    placeMarker(map, coords, enableTooltips, studyAccession) {
        const formattedCoords = getSamplePosition(coords);
        generateIcon(formattedCoords.count, function(src) {
            let pos = new google.maps.LatLng(formattedCoords.lat, formattedCoords.lng);

            const marker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: src
            });
            if (enableTooltips) {
                let infowindow = new google.maps.InfoWindow({
                    content: template(formattedCoords)
                });
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                    const samplesParams = $.param({
                        latitude_gte: formattedCoords.lat,
                        latitude_lte: formattedCoords.lat,
                        longitude_gte: formattedCoords.lng,
                        longitude_lte: formattedCoords.lng,
                        study_accession: studyAccession
                    });
                    const samples = new api.SamplesCollection();
                    const $list = $('#' + formattedCoords['uuid-samples']);
                    samples.fetch({
                        data: samplesParams
                    }).then((response) => {
                        $list.empty();
                        _.each(response.data, function(d) {
                            addSampleToList($list, api.Sample.prototype.parse(d));
                        });
                        $('#' + formattedCoords['uuid-loading-icon']).fadeOut();
                    });
                });
            }
        });
    }
};

