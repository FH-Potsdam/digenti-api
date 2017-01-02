//////////////
// HERE API
//////////////

// Calculate isoline: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-isoline.html
// Calculate route: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html

var config = require('./../config');
var utils = require('./../utils/index');
var rp = require('request-promise');
var fs = require('fs');
var util = require('util');
var fileExists = require('file-exists');
var turf = require('turf');

///////////////////////
// Query Parameters
///////////////////////

var appParams = {
    app_id: config.here.app_id,
    app_code: config.here.app_code,
};

var isolineParams = {
    mode: 'fastest;car',
    resolution: 10,
    maxpoints: 1000,
    range: 30,
    rangetype: 'time'
    // start: 'geo!52.51578,13.37749'
};

var routeParams = {
    mode: 'fastest;car',
    alternatives: 1,
    representation: 'display',
    routeattributes: 'waypoints,summary,shape,legs,routeId',
    maneuverattributes: 'direction,action,travelTime,startAngle',
    returnelevation: 'true',
    legAttributes: 'maneuvers,waypoint,length,travelTime'
    // waypoint0: 'geo!52.51578,13.37749', // start
    // waypoint1: 'geo!52.51578,13.37749'  // end
    // avoidareas: 52.517100760,[Bounding Box]
};


///////////////////////
// ISOLINE Functions
///////////////////////

// api/isoline/:coords/:range
function getIsoline(req, res, next) {

    // Parse input params
    var center = (req.params.center) ? req.params.center : 'destination', // Coordinate as 'start' or 'destination'
        coords = (req.params.coords).split(",");

    // In case of multiple values
    var rangeArray = (req.params.range).split(",");

    // The range's unit is seconds (input parameter in minutes)
    var range = rangeArray.map(function(x) { return parseInt(x,10)*60; }).toString();

    // Query params
    var params = {};
    params[center] = 'geo!'+coords[0]+','+coords[1];
    params['range'] = range;

    // Define filename of cached file
    var filename = params[center] + '_' + params['range'] + '.json';

    // get cached file
    var file = utils.cache.getCacheFile("isoline", filename);

    if (utils.cache.checkCacheValidity(file)) {
        // cache still valid

        fs.readFile(file, function read(err, data) {
            if (err) { throw err; }
            var jsonContent = JSON.parse(data);
            res.status(200).json(jsonContent)
        });

    } else {
        // cache expired

        // Merge with defaults
        var query = Object.assign({}, appParams, isolineParams, params);

        //console.log("Isoline requested with params: " + JSON.stringify(query));

        // Request
        var options = {
            method: 'GET',
            uri: config.here.isoline_base,
            qs: query,
            json: true
        };

        rp(options)
            .then(function (data) {
                // calculate JSON for isoline
                var response = utils.here.processIsolineResponse(data);

                response = turf.simplify(response, config.simplify.tolerance.isoline, true);

                // cache isoline JSON
                utils.cache.writeCacheFile(file, response);
                res.status(200).json(response)
            })
            .catch(function (err) {
                return next(err);
            });
    }

}


/////////////////////
// ROUTE Functions
/////////////////////

function calculateRoute(req, res, next) {

    // Parse input params
    var start = (req.params.start).split(","),
        end = (req.params.end).split(",");

    var slice = (typeof req.query.slice !== 'undefined' && req.query.slice !== 'false' && parseInt(req.query.slice) !== 0);

    // Query params
    var params = {};
    params['waypoint0'] = 'geo!'+start[0]+','+start[1];
    params['waypoint1'] = 'geo!'+end[0]+','+end[1];

    // Define filename of cached file
    var filename = params['waypoint0'] + '_' + params['waypoint1'] + '.json';

    // get cached file
    var file = utils.cache.getCacheFile("route", filename);

    console.log("File: " + file);

    if (utils.cache.checkCacheValidity(file)) {
        // cache still valid

        fs.readFile(file, function read(err, data) {
            if (err) { throw err; }
            var jsonContent = JSON.parse(data);
            res.status(200).json(jsonContent)
        });

    } else {
        // cache expired

        // Merge with defaults
        var query = Object.assign({}, appParams, routeParams, params);

        console.log("Route calculation requested with params: " + JSON.stringify(query));

        // Request
        var options = {
            method: 'GET',
            uri: config.here.route_base,
            qs: query,
            json: true
        };

        rp(options)
            .then(function (data) {

                // calculate JSON for route
                var routeGeoJSON = utils.here.processRouteResponse(data, params);

                // Slice route with a resolution and get elevation from it
                if (slice) {
                    var response = [];

                    // Add LineString route in the first position
                    response.push(routeGeoJSON);

                    // Use geoprocessing's sliceLine3D function
                    utils.geo.sliceRoute(routeGeoJSON, config.slicing.resolution / 1000, 'kilometers')
                        .then (function (slicedPolys) {

                            var fc = turf.featureCollection(slicedPolys);

                            response.push(fc);

                            // cache route JSON
                            utils.cache.writeCacheFile(file, response);
                            res.status(200).json(response)

                        })
                        .catch(function (err) {
                            console.log('Something went wrong: ' + err);
                            return next(err);
                        });
                } else {
                    // cache route JSON
                    utils.cache.writeCacheFile(file, routeGeoJSON);
                    res.status(200).json(routeGeoJSON)
                }
            })
            .catch(function (err) {
                return next(err);
            });
    }
}



/////////////
// Exports
/////////////

module.exports = {
    getIsoline: getIsoline,
    calculateRoute: calculateRoute
};
