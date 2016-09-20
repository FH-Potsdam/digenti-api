/////////////////////////
// GEOPROCESSING Utils
/////////////////////////

var geoprocessing = {};

var turf = require('turf');
var unique = require('array-unique');
var jsonfile = require('jsonfile');


/////////////////////
// ROUTE Functions
/////////////////////

// Returns overlapping geometry of two path arrays of points of a line
geoprocessing.getOverlappingGeometry = function(geometry1, geometry2) {

    var overlappingGeometry = [];

    for (var i=0; i<geometry1.length; i++) {
        for (var j=0; j<geometry2.length; j++) {
            if (geometry1[i].equals(geometry2[j])) {
                overlappingGeometry.push(geometry1[i]);
            }
        }
    }

    return overlappingGeometry;
}

geoprocessing.compareRouteWithCollection = function(r, c) {

    // there are several routes in the collection
    if (c.length > 1) {

        // there are existing routes
        // for all existing routes
        for (var i=0; i<c.length; i++) {

            // current route is equal to current route in collection
            if (r.id !== c[i].id) {

                var overlappingRoute = this.getOverlappingGeometry(r.geometry, c[i].geometry);

                if (overlappingRoute.length>0) {

                    var test = overlappingRoute.length.toString().concat(overlappingRoute[0][0].toString()).concat(overlappingRoute[0][1].toString());

                    var overlappingRoute_exists = false;
                    for (var k=0; j<overlappingRoutes.length; j++) {
                        if (overlappingRoutes[j] === test) {
                            overlappingRoute_exists = true;
                            break;
                        }
                    }

                    if (!overlappingRoute_exists) {

                        overlappingRoutes.push(test);

                        pushToKnotPoint(overlappingRoute[0]);
                        pushToKnotPoint(overlappingRoute[overlappingRoute.length-1]);

                        var feature = {};
                        feature.type = "Feature";
                        feature.geometry = {};
                        feature.geometry.type = "LineString";
                        feature.geometry.coordinates = overlappingRoute;
                        feature.properties = {};
                        resultingGEOJSON.features.push(feature);
                    }
                }
            }
        }
    }
}




geoprocessing.calculateKnotPoints = function(c) {


    var knotPoints = [];

    // there are several routes in the collection
    if (c.length > 1) {

        // there are existing routes
        // for all existing routes
        for (var i = 0; i < c.length; i++) {

            //console.log();
            //console.log(c[i]);

            for (var j = i; j < c.length; j++) {

                //console.log(c[i].route.geometry.coordinates.length);

                var overlappingRoute = this.getOverlappingGeometry(c[i].route.geometry.coordinates, c[j].route.geometry.coordinates);

                //console.log(overlappingRoute);

                if (overlappingRoute.length > 0) {
                    knotPoints.push(overlappingRoute[0]);
                    knotPoints.push(overlappingRoute[overlappingRoute.length-1]);
                }
            }
        }
    }

    unique(knotPoints);

    return knotPoints;
}


geoprocessing.splitRoutes = function(r, k) {

    console.log("Start splitting routes.");

    var queue = [];
    var result = [];

    for (var i=0; i < r.length; i++) {
        queue.push(r[i].route.geometry.coordinates);
    }

    while (queue.length > 0) {

        var first_element = queue[0];

        //console.log(queue[0]);
        //console.log();
        //console.log("queue.length: " + queue.length);

        var route_splitted = false;
        var splitting_point = 0;

        for (var j = 1; j < first_element.length-1; j++) {

            if (!route_splitted) {

                for (var i = 0; i < k.length; i++) {

                    if (first_element[j].equals(k[i]) && !route_splitted) {

                        splitting_point = j;
                        route_splitted = true;
                        console.log("Found Knotpoint on Route");
                    }
                }
            }
        }

        if (route_splitted) {

            console.log("Split Route at point " + splitting_point);

            var part1 = first_element.slice(0, splitting_point+1);
            var part2 = first_element.slice(splitting_point);

            queue.push(part1);
            queue.push(part2);
            //unique(queue);

        } else {

            if (first_element.length > 1) {
                result.push(first_element);
            }

            if (queue.length === 1) {
                //console.log(result);
                console.log("result.length: " + result.length);
                result = utils.array.arrayUnique(result);
                console.log("result.length: " + result.length);
                for (var u=0; u<result.length; u++) {
                    //console.log(result[u].length);
                    //console.log(result[u]);
                }
            }
        }

        queue.splice(0, 1);
    }

    // Create an array of features (LineString)
    var lineStringArray = [];
    for (var i=0; i<result.length; i++) {

        var coords = [];

        console.log(result[i]["coords"]);

        for (var j=0; j<result[i]["coords"].length; j++) {
            coords[j] = [];
            coords[j][0] = result[i]["coords"][j][0];
            coords[j][1] = result[i]["coords"][j][1];
            coords[j][2] = result[i]["coords"][j][2];
        }

        // Feature properties
        var properties = {
            "importance-score": result[i]["counter"],
            "stroke-width": (result[i]["counter"]*0.5 + 2)
        }

        // Create linestring
        var lineString = turf.lineString(coords, properties);

        lineStringArray.push(lineString);
    }

    // Create a GeoJSON FeatureCollection based on the array of LineStrings
    var featureCollection = turf.featureCollection(lineStringArray);

    var file = 'data.json';

    jsonfile.writeFile(file, featureCollection, function (err) {
        console.error(err)
    });

    return featureCollection;
}

module.exports = geoprocessing;
