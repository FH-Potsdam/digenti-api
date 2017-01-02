/////////////////////////
// GEOPROCESSING Utils
/////////////////////////

var geoprocessing = {};

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var turf = require('turf');
turf.lineChunk = require('turf-line-chunk');

var unique = require('array-unique');
var jsonfile = require('jsonfile');


/////////////////////////////
// ROUTE Slicing Functions
/////////////////////////////

// This function slices a route and gets the elevation for all slices from the DEM (PostGREs)
geoprocessing.sliceRoute3D = async (function(route, chunkLength, chunkUnit) {

    console.log("Geoprocessing: Slice route in chunks with length " + chunkLength + " " + chunkUnit);

    var utils = module.parent.exports;

    // Get overall distance of the road
    // var distance = turf.lineDistance(route, 'kilometers');
    // console.log("distance: " + distance);

    // var points = [];
    var slicedPolys = [];

    // Slice line in multiple chunks of a given distance
    var routeChunks = turf.lineChunk(route, chunkLength, chunkUnit);

    console.log("Querying elevation of " + routeChunks.features.length + " points...");

    // For each chunk, select the first coord
    for (var i=0; i<routeChunks.features.length; i++) {

        var chunk = routeChunks.features[i];

        // Get first point in the slice
        var coords = chunk.geometry.coordinates[0];
        var point = turf.point(coords);
        // points.push(turf.point(coords));

        // Create a buffered polygon and get bounding box
        // var buffer = turf.buffer(chunk, 0.5*chunkLength, chunkUnit);
        var buffer = turf.buffer(point, 0.5*chunkLength, chunkUnit);
        var bbox = turf.bbox(buffer);
        var poly = turf.bboxPolygon(bbox);

        // Get elevation from PostGREs
        poly.properties.elevation = await (utils.postgres.getElevationByPoint(point));

        slicedPolys.push(poly);
    }

    console.log("Slicing finished!");

    return slicedPolys;
});

// This function slices a route and gets the elevation from the input file, if existent (HERE format [lat, lon, elevation])
geoprocessing.sliceRoute = async (function(route, chunkLength, chunkUnit) {

    console.log("Geoprocessing: Slice route in chunks with length " + chunkLength + " " + chunkUnit);
    // console.log("Geoprocessing: Slice route in chunks with length " + chunkLength + " " + chunkUnit);

    var utils = module.parent.exports;

    console.log("coords length: " + route.geometry.coordinates.length);

    // Get overall distance of the road
    // var distance = turf.lineDistance(route, 'kilometers');
    // console.log("distance: " + distance);

    // Create an array of points with elevation property
    var routePoints = [];
    for (var i=0; i<route.geometry.coordinates.length; i++) {

        var coords = route.geometry.coordinates[i];
        var point = turf.point(coords);

        // elevation exists
        if (coords.length > 2) {
            point.properties.elevation = coords[2];
        }
        routePoints.push(point);
    }

    // Feature collection of route points (to use turf.nearest())
    var routePointsFC = turf.featureCollection(routePoints);

    // Slice line in multiple chunks of a given distance
    var slicedPolys = [];
    var routeChunks = turf.lineChunk(route, chunkLength, chunkUnit);

    console.log("Querying elevation of " + routeChunks.features.length + " points...");

    // For each chunk, select the first coord
    for (var j=0; j<routeChunks.features.length; j++) {

        var chunk = routeChunks.features[j];

        // Get first point in the slice
        var coords = chunk.geometry.coordinates[0];
        var point = turf.point(coords);

        // Create a buffered polygon and get bounding box
        // var buffer = turf.buffer(chunk, 0.5*chunkLength, chunkUnit);
        var buffer = turf.buffer(point, 0.5*chunkLength, chunkUnit);
        var bbox = turf.bbox(buffer);
        var poly = turf.bboxPolygon(bbox);

        // Get elevation from input route
        var nearest = turf.nearest(point, routePointsFC);
        if (nearest.properties.elevation) {
            poly.properties.elevation = nearest.properties.elevation;
        } /*else {
            poly.properties.elevation = await (utils.postgres.getElevationByPoint(point));
        }*/

        slicedPolys.push(poly);
    }

    console.log("Slicing finished!");

    return slicedPolys;
});


///////////////////////////
// ROUTE Parts Functions
///////////////////////////

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
        //console.log(r[i]);
        var el = [];
        el["id"] = [];
        el["id"].push(r[i].route.id);
        el["coordinates"] = r[i].route.geometry.coordinates;
        queue.push(el);
    }

    // queue not empty
    while (queue.length > 0) {

        // select the first queue-element as current
        var current_element = queue[0];

        // do not split the route by default
        var split_route = false;
        // this var holds the splitting_point
        var splitting_point = 0;


        for (var j = 1; j < current_element["coordinates"].length-1; j++) {

            if (!split_route) {

                for (var i = 0; i < k.length; i++) {

                    if (current_element["coordinates"][j].equals(k[i]) && !split_route) {
                        splitting_point = j;    // set the splitting_point (with current position)
                        split_route = true;     // set bool split_route to force splitting
                    }
                }
            }
        }

        // route needs to be splitted
        if (split_route) {

            // Split route on splitting_point
            var part1 = [];
            part1["id"] = current_element["id"];
            part1["coordinates"] = current_element["coordinates"].slice(0, splitting_point+1);

            var part2 = [];
            part2["id"] = current_element["id"];
            part2["coordinates"] = current_element["coordinates"].slice(splitting_point);

            // push both parts into queue
            queue.push(part1);
            queue.push(part2);

        // no need to split route
        } else {

            // push the route to result-Array
            if (current_element["coordinates"].length > 1) { result.push(current_element); }

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
            "id": result[i]["id"],
            "importancescore": result[i]["counter"],
            "strokewidth": (result[i]["counter"]*0.25 + 2)
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
            if (arr[i]["coordinates"].length === uniqueArray[j]["coords"].length) {

                // could be a duplicate, so set it to true
                duplicate = true;

                for (var k=0; k<arr[i]["coordinates"].length; k++) {
                    // If a part of a coord-point dont't equals, it is no duplicate
                    if ((arr[i]["coordinates"][k][0] !== uniqueArray[j]["coords"][k][0]) ||
                        (arr[i]["coordinates"][k][1] !== uniqueArray[j]["coords"][k][1]) ||
                        (arr[i]["coordinates"][k][2] !== uniqueArray[j]["coords"][k][2])
                       ) { duplicate = false; } // no duplicate
                }

                // route part is duplicate -> raise its counter
                if (duplicate) {
                    uniqueArray[j]["counter"] = uniqueArray[j]["counter"] + 1 ;
                    uniqueArray[j]["id"] = uniqueArray[j]["id"].concat(arr[i]["id"]);
                }
            }
        }

        // no duplicate, push new entry to uniqueArray
        if (!duplicate) {
            var element = [];                           // init
            element["coords"] = arr[i]["coordinates"];  // here are the coordinates
            element["counter"] = 1;                     // init counter var
            element["id"] = arr[i]["id"];               // init counter var
            uniqueArray.push(element);                  // push
        }

    }

    // return our uniqueArray
    return uniqueArray;

}



// export geoprocessing
module.exports = geoprocessing;
