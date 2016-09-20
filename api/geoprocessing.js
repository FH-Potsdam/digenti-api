//////////////
// HERE API
//////////////

// Calculate isoline: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-isoline.html
// Calculate route: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html

var config = require('./../config');
var utils = require('./../utils/index');
var rp = require('request-promise');
var turf = require('turf');
var unique = require('array-unique');
var jsonfile = require('jsonfile');


/////////////////////
// ROUTE Functions
/////////////////////

function calculateRouteParts(req, res, next) {

    // Input Object to Array
    var arr = Object.keys(req.body).map(function (key) {return req.body[key]});

    // Calculate the Knotpoints (Points where Routeparts meet)
    var knotPoints = utils.geo.calculateKnotPoints(arr);

    // calculate the routeparts
    var routeParts = utils.geo.splitRoutes(arr, knotPoints);

    // return result as json
    res.status(200)
        .json({
            status: 'success',
            data: routeParts,
            message: 'This is the array containing ' + routeParts.features.length + ' unique route parts'
        });

}


/////////////
// Exports
/////////////

module.exports = {
    calculateRouteParts: calculateRouteParts
};
