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

    //console.log(arr);

    var knotPoints = utils.geo.calculateKnotPoints(arr);

    var result = utils.geo.splitRoutes(arr, knotPoints);

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
