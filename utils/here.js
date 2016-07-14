var here = {};
var turf = require('turf');


///////////////////
// Isoline Utils
///////////////////

// Converts HERE isoline response to GeoJSON Polygon feature
here.processIsolineResponse = function(res) {
    var isoline = res.response.isoline[0];

    var coordsArray = this.shapeToCoordinatesArray(isoline.component[0].shape);

    // Add properties (for now in the returned format)
    var properties = {
        center: res.response.center
    }

    // Start / Destination
    if (res.response.start) {
        properties.start = res.response.start;
    } else if (res.response.destination) {
        properties.destination = res.response.destination;
    }

    return turf.polygon([coordsArray], properties);
}


/////////////////
// Route Utils
/////////////////

// Converts HERE route response to GeoJSON Polygon feature
here.processRouteResponse = function(res) {

    var routeId = res.response.route[0].routeId,
        distance = res.response.route[0].summary.distance,
        travelTime = res.response.route[0].summary.travelTime;

    var coordsArray = this.shapeToCoordinatesArray(res.response.route[0].shape);

    // Add properties
    var properties = {};
    properties['routeId'] = routeId;
    properties['distance'] = distance;
    properties['travelTime'] = travelTime;

    return turf.lineString(coordsArray, properties);
}


//////////////////
// Format Utils
//////////////////

here.shapeToCoordinatesArray = function(shape) {

    var coordsArray = shape.map(function(str) {
        var coords = str.split(",")   // response is an array of strings : ["52.517395,13.3773136", "52.5172234,13.3777428"]
                        .map(Number)  // We still get the objects parsed as string
                        .reverse();   // Reverse lat/lon as lon/lat for GeoJSON

        // Remove altitude for coordinates with 3 components
        // This needs to be fixed and only reverse lat/lon
        if (coords.length == 3)
            coords = coords.splice(1);

        return coords;
    });

    return coordsArray;
}

module.exports = here;
