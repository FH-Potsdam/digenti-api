//////////////
// Geoprocessing API
//////////////

var config = require('./../config');
var utils = require('./../utils/index');
var rp = require('request-promise');
var turf = require('turf');
var unique = require('array-unique');
var jsonfile = require('jsonfile');
var fileExists = require('file-exists');
var fs = require('fs');
var util = require('util');


/////////////////////
// ROUTE Functions
/////////////////////

function calculateRouteParts(req, res, next) {

    // Define filename of cached file
    var filename = 'routeparts.json';

    // get cached file
    var file = utils.cache.getCacheFile("routeparts", filename);

    if (utils.cache.checkCacheValidity(file)) {

        fs.readFile(file, function read(err, data) {
            if (err) { throw err; }
            var jsonContent = JSON.parse(data);
            // return result as json
            res.status(200)
                .json({
                    status: 'success',
                    data: jsonContent,
                    message: 'This is the array containing ' + jsonContent.features.length + ' unique route parts'
                });
        });

    } else {

        // Input Object to Array
        var arr = Object.keys(req.body).map(function (key) {return req.body[key]});

        // Calculate the Knotpoints (Points where Routeparts meet)
        var knotPoints = utils.geo.calculateKnotPoints(arr);

        // calculate the routeparts
        var routeParts = utils.geo.splitRoutes(arr, knotPoints);

        for (i = 0; i < routeParts.features.length; i++) {
            routeParts.features[i] = turf.simplify(routeParts.features[i], config.simplify.tolerance.route, true);
        }

        // cache routeparts JSON
        utils.cache.writeCacheFile(file, routeParts);

        // return result as json
        res.status(200)
            .json({
                status: 'success',
                data: routeParts,
                message: 'This is the array containing ' + routeParts.features.length + ' unique route parts'
            });

    }

}


/////////////
// Exports
/////////////

module.exports = {
    calculateRouteParts: calculateRouteParts
};
