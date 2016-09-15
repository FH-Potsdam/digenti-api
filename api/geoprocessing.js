//////////////
// HERE API
//////////////

// Calculate isoline: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-isoline.html
// Calculate route: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html

var utils = require('./../utils/index');
var rp = require('request-promise');
var unique = require('array-unique');
var turf = require('turf');
// var lineString = require('turf-linestring');
// var featureCollection = require('turf-featurecollection');
var jsonfile = require('jsonfile');



// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});




// Returns overlapping geometry of two path arrays of points of a line
function getOverlappingGeometry(geometry1, geometry2) {

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



function compareRouteWithCollection(r, c) {

    // there are several routes in the collection
    if (c.length > 1) {

        // there are existing routes
        // for all existing routes
        for (var i=0; i<c.length; i++) {

            // current route is equal to current route in collection
            if (r.id !== c[i].id) {

                var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);

                if (overlapping_route.length>0) {

                    var test = overlapping_route.length.toString().concat(overlapping_route[0][0].toString()).concat(overlapping_route[0][1].toString());

                    var overlapping_route_exists = false;
                    for (var k=0; j<overlapping_routes.length; j++) {
                        if (overlapping_routes[j] === test) {
                            overlapping_route_exists = true;
                            break;
                        }
                    }

                    if (!overlapping_route_exists) {

                        overlapping_routes.push(test);

                        pushToKnotpoint(overlapping_route[0]);
                        pushToKnotpoint(overlapping_route[overlapping_route.length-1]);
                        var feature = {};
                        feature.type = "Feature";
                        feature.geometry = {};
                        feature.geometry.type = "LineString";
                        feature.geometry.coordinates = overlapping_route;
                        feature.properties = {};
                        resultingGEOJSON.features.push(feature);

                    }

                }


            }
        }
    }
}





function calculateKnotPoints(c) {


    var knotpoints = [];

    // there are several routes in the collection
    if (c.length > 1) {

        // there are existing routes
        // for all existing routes
        for (var i = 0; i < c.length; i++) {

            //console.log();
            //console.log(c[i]);

            for (var j = i; j < c.length; j++) {

                //console.log(c[i].route.geometry.coordinates.length);

                var overlapping_route = getOverlappingGeometry(c[i].route.geometry.coordinates, c[j].route.geometry.coordinates);

                //console.log(overlapping_route);

                if (overlapping_route.length > 0) {
                    knotpoints.push(overlapping_route[0]);
                    knotpoints.push(overlapping_route[overlapping_route.length-1]);
                }

            }
        }

    }

    unique(knotpoints);

    return knotpoints;
}


function splitRoutes(r, k) {

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
                result = arrayUnique(result);
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
    // var featureCollection = featureCollection(lineStringArray);

    var file = 'data.json';

    jsonfile.writeFile(file, featureCollection, function (err) {
        console.error(err)
    });

    return featureCollection;
}


function arrayUnique(arr) {

    var uniqueArray = [];

    for (var i=0; i<arr.length; i++) {

        var duplicate = false;

        for (var j=0; j<uniqueArray.length; j++) {

            //console.log("arr: " + arr[i].length + "     –     uniqueArray: " + uniqueArray[j]["coords"].length);

            if (arr[i].length === uniqueArray[j]["coords"].length) {

                for (var k=0; k<arr[i].length; k++) {
                    if ((arr[i][k][0] === uniqueArray[j]["coords"][k][0]) && (arr[i][k][1] === uniqueArray[j]["coords"][k][1]) && (arr[i][k][2] === uniqueArray[j]["coords"][k][2])) {
                        duplicate = true;
                    }
                }

                if (duplicate) { uniqueArray[j]["counter"] = uniqueArray[j]["counter"] + 1 ; }
            }
        }

        console.log(i);
        if (!duplicate) {
            var a = [];
            a["coords"] = arr[i];
            a["counter"] = 1;
            uniqueArray.push(a);
        }
        console.log(i);

    }

    return uniqueArray;
}


/////////////////////
// ROUTE Functions
/////////////////////

function calculateRouteParts(req, res, next) {

    // Input Object to Array
    var arr = Object.keys(req.body).map(function (key) {return req.body[key]});

    //console.log(arr);

    var knotpoints = calculateKnotPoints(arr);

    var result = splitRoutes(arr, knotpoints);



    //console.log(knotpoints);

    res.status(200)
        //.json(utils.here.processRouteResponse(data))
        .json({
            status: 'success',
            data: result,
            message: 'Retrieved array of ' + result.length + ' items'
        });

}


/////////////
// Exports
/////////////

module.exports = {
    calculateRouteParts: calculateRouteParts
};
