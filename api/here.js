//////////////
// HERE API
//////////////

// Calculate isoline: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-isoline.html
// Calculate route: https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html

var config = require('./../config');
var utils = require('./../utils/index');
var rp = require('request-promise');


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
        coords = (req.params.coords).split(","),
        range = parseInt(req.params.range)*60; // The range's unit is seconds

    console.log('\n'+center+'\n');

    // Query params
    var params = {};
    params[center] = 'geo!'+coords[0]+','+coords[1];
    params['range'] = range;

    // Merge with defaults
    var query = Object.assign({}, appParams, isolineParams, params);

    console.log("Isoline requested with params: " + JSON.stringify(query));

    // Request
    var options = {
        method: 'GET',
        uri: config.here.isoline_base,
        qs: query,
        json: true
    };

    rp(options)
        .then(function (data) {
            res.status(200)
                .json(utils.here.processIsolineResponse(data))
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ONE isoline'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}


/////////////////////
// ROUTE Functions
/////////////////////

function calculateRoute(req, res, next) {

    // Parse input params
    var start = (req.params.start).split(","),
        end = (req.params.end).split(",");

    // Query params
    var params = {};
    params['waypoint0'] = 'geo!'+start[0]+','+start[1];
    params['waypoint1'] = 'geo!'+end[0]+','+end[1];

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

    // res.status(200)
    //   .json({
    //     status: 'success',
    //     data: options,
    //     message: 'calculate route'
    //   });

    rp(options)
        .then(function (data) {
            res.status(200)
                .json(utils.here.processRouteResponse(data))
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ONE isoline'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}


/////////////
// Exports
/////////////

module.exports = {
    getIsoline: getIsoline,
    calculateRoute: calculateRoute
};
