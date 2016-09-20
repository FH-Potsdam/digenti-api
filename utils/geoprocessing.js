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

        // there are existing routes -> for all existing routes
        for (var i=0; i<c.length; i++) {

            // current route is equal to current route in collection
            if (r.id !== c[i].id) {

                var overlappingRoute = this.getOverlappingGeometry(r.geometry, c[i].geometry);

                if (overlappingRoute.length > 0) {

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

            for (var j = i; j < c.length; j++) {

                var overlappingRoute = this.getOverlappingGeometry(c[i].route.geometry.coordinates, c[j].route.geometry.coordinates);

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

    //console.log("Start splitting routes.");

    var queue = [];     // this one holds our queue with routes to be processed
    var result = [];    // this one holds our result of unique route-parts in the end

    // push the coordinates of all incoming routes to the queue
    for (var i=0; i < r.length; i++) {
        queue.push(r[i].route.geometry.coordinates);
    }

    // queue not empty
    while (queue.length > 0) {

        // select the first queue-element as current
        var current_element = queue[0];

        // do not split the route by default
        var split_route = false;
        // this var holds the splitting_point
        var splitting_point = 0;


        for (var j = 1; j < current_element.length-1; j++) {

            if (!split_route) {

                for (var i = 0; i < k.length; i++) {

                    if (current_element[j].equals(k[i]) && !split_route) {
                        splitting_point = j;    // set the splitting_point (with current position)
                        split_route = true;     // set bool split_route to force splitting
                    }
                }
            }
        }

        // route needs to be splitted
        if (split_route) {

            // Split route on splitting_point
            var part1 = current_element.slice(0, splitting_point+1);
            var part2 = current_element.slice(splitting_point);

            // push both parts into queue
            queue.push(part1);
            queue.push(part2);

        // no need to split route
        } else {

            // push the route to result-Array
            if (current_element.length > 1) { result.push(current_element); }

            // queue is empty – unique result-array
            if (queue.length === 1) {
                //console.log("result.length: " + result.length);
                // Make the array unique
                result = this.transformArray(result);
                //console.log("result.length: " + result.length);
            }
        }

        // remove current_element from queue
        queue.splice(0, 1);

    }

    // Create an array of features (LineString)
    var lineStringArray = [];
    for (var i=0; i<result.length; i++) {

        var coords = [];

        // copy values
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

        // push lineString to the array
        lineStringArray.push(lineString);
    }

    // Create a GeoJSON FeatureCollection based on the array of LineStrings
    var featureCollection = turf.featureCollection(lineStringArray);

    // write featureCollection to a geojson-File for testing purposes
    var file = 'data.json';
    jsonfile.writeFile(file, featureCollection, function (err) { console.error(err) });

    // return our featureCollection
    return featureCollection;

}



// Array Unique
geoprocessing.transformArray = function(arr) {

    // this var holds the uniqueArray later
    var uniqueArray = [];

    // loop through input array
    for (var i=0; i<arr.length; i++) {

        // element is not a duplicate by default
        var duplicate = false;

        // loop through result array
        for (var j=0; j<uniqueArray.length; j++) {

            // length of the elements is equal -> check it more detailed
            if (arr[i].length === uniqueArray[j]["coords"].length) {

                // could be a duplicate, so set it to true
                duplicate = true;

                for (var k=0; k<arr[i].length; k++) {
                    // If a part of a coord-point dont't equals, it is no duplicate
                    if ((arr[i][k][0] !== uniqueArray[j]["coords"][k][0]) ||
                        (arr[i][k][1] !== uniqueArray[j]["coords"][k][1]) ||
                        (arr[i][k][2] !== uniqueArray[j]["coords"][k][2])
                       ) { duplicate = false; } // no duplicate
                }

                // route part is duplicate -> raise its counter
                if (duplicate) { uniqueArray[j]["counter"] = uniqueArray[j]["counter"] + 1 ; }
            }
        }

        // no duplicate, push new entry to uniqueArray
        if (!duplicate) {
            var element = [];               // init
            element["coords"] = arr[i];     // here are the coordinates
            element["counter"] = 1;         // init counter var
            uniqueArray.push(element);      // push
        }

    }

    // return our uniqueArray
    return uniqueArray;

}





// export geoprocessing
module.exports = geoprocessing;
