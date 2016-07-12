var config = require('./../config');
var turf = require('turf');
var rp = require('request-promise');
// var Promise = require("bluebird");
// var request = Promise.promisifyAll(require("request"), {multiArgs: true});

var appParams = {
    app_id: config.here.app_id,
    app_code: config.here.app_code,
};

var routingParams = {
    mode: 'fastest;car',
    resolution: 10,
    maxpoints: 1000,
    range: 30,
    rangetype: 'time'
    // start: 'geo!52.51578,13.37749'
};


////7///////////////
// API Functions
////////////////////

// api/isoline
// function getIsoline(req, res, next) {
//     console.log('   - Params: ' + JSON.stringify(req.query) + '\n');
// }

// api/isoline/:coords/:range
function getIsoline(req, res, next) {

    // Parse input params
    var coords = (req.params.coords).split(","),
        range = parseInt(req.params.range)*60; // The range's unit is seconds

    var params = {
        destination: 'geo!'+coords[0]+','+coords[1],
        range: range
    }

    // Merge with defaults
    var query = Object.assign({}, appParams, routingParams, params);

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
                .json(processIsolineResponse(data))
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
// Data Processing
/////////////////////

/*
* Converts HERE responses to GeoJSON Polygon feature
*/
function processIsolineResponse(res) {
    var isoline = res.response.isoline[0];

    var coordsArray = (isoline.component[0].shape).map(function(str) {
        return str.split(",")   // response is an array of strings : ["52.517395,13.3773136", "52.5172234,13.3777428"]
                  .map(Number)  // We still get the objects parsed as string
                  .reverse();   // Reverse lat/lon as lon/lat for GeoJSON
    });

    // Add properties (for now in the returned format)
    var properties = {
        center: res.response.center
    }

    if (res.response.start) {
        properties.start = res.response.start;
    } else if (res.response.destination) {
        properties.destination = res.response.destination;
    }

    return turf.polygon([coordsArray], properties);
}


/////////////
// Exports
/////////////

module.exports = {
    getIsoline: getIsoline
};
