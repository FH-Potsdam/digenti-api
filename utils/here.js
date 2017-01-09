////////////////
// HERE Utils
////////////////

var here = {};
var turf = require('turf');
var jsonfile = require('jsonfile');
var util = require('util');


///////////////////
// Isoline Utils
///////////////////

// Converts HERE isoline response to GeoJSON Polygon feature
here.processIsolineResponse = function(res) {

    var featuresArray = [];

    for (var i=0; i<res.response.isoline.length; i++) {

        var isoline = res.response.isoline[i];

        var coordsArray = this.shapeToCoordinatesArray(isoline.component[0].shape);

        // Add properties (for now in the returned format)
        var properties = {
            range: parseInt(isoline.range,10) / 60, // Convert back to minutes
            center: res.response.center
        }

        // Start / Destination
        if (res.response.start) {
            properties.start = res.response.start;
        } else if (res.response.destination) {
            properties.destination = res.response.destination;
        }

        // Create a polygon feature for each isoline and add it to an array of features
        var polygon = turf.polygon([coordsArray], properties);
        featuresArray.push(polygon);
    }

    // Create a GeoJSON FeatureCollection based on the array of LineStrings
    var featureCollection = turf.featureCollection(featuresArray);

    return featureCollection;
}


/////////////////
// Route Utils
/////////////////

// Converts HERE route response to GeoJSON Polygon feature
here.processRouteResponse = function(res, params) {

    var routeId = res.response.route[0].routeId,
        distance = res.response.route[0].summary.distance,
        travelTime = res.response.route[0].summary.travelTime;

    var waypointsArray = this.processWaypoints(res.response.route[0].waypoint);
        coordsArray = this.shapeToCoordinatesArray(res.response.route[0].shape);

    var properties = {};
    properties['routeId'] = routeId;
    properties['distance'] = distance;
    properties['travelTime'] = travelTime;
    properties['waypoints'] = waypointsArray;

    var linestring = turf.lineString(coordsArray, properties);

    return linestring;


}


//////////////////
// Format Utils
//////////////////

here.processWaypoints = function(waypointsArray) {

    var formatedArray = [];

    for (var i=0; i<waypointsArray.length; i++) {
        var waypoint = {};

        // Original and mapped position
        var originalPosition = [waypointsArray[i].originalPosition.longitude, waypointsArray[i].originalPosition.latitude],
            mappedPosition = [waypointsArray[i].mappedPosition.longitude, waypointsArray[i].mappedPosition.latitude];

        waypoint["originalPosition"] = originalPosition;
        waypoint["mappedPosition"] = mappedPosition;

        // Calculate distance
        var pt1 = turf.point(originalPosition),
            pt2 = turf.point(mappedPosition);

        var distance = turf.distance(pt1, pt2, 'kilometers');

        waypoint["distance"] = parseInt(1000 * distance, 10);

        formatedArray.push(waypoint);
    }
    return formatedArray;
}

here.shapeToCoordinatesArray = function(shape) {

    var coordsArray = shape.map(function(str) {
        var coords = str.split(",")   // response is an array of strings : ["52.517395,13.3773136", "52.5172234,13.3777428"]
                        .map(Number)  // We still get the objects parsed as string
                        .reverse();   // Reverse lat/lon as lon/lat for GeoJSON

        // Format altitude for coordinates with 3 components (including altitude)
        if (coords.length == 3) {
            var altitude = coords.splice(0, 1)[0];
            coords.push(altitude);
        }

        return coords;
    });

    return coordsArray;
}

module.exports = here;
