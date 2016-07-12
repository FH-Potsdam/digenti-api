var config = require('./../config');

var rp = require('request-promise');
// var Promise = require("bluebird");
// var request = Promise.promisifyAll(require("request"), {multiArgs: true});

var appParams = {
    app_id: config.here.app_id,
    app_code: config.here.app_code,
};

var routingParams = {
    mode: 'fastest;car',
    resolution: 1,
    maxpoints: 1000,
    range: 30,
    rangetype: 'time'
    // start: 'geo!52.51578,13.37749'
};


////7///////////////
// API Functions
////////////////////

// api/isoline/:coords/:range
function getIsoline(req, res, next) {

    // Parse input params
    var coords = (req.params.coords).split(","),
        range = parseInt(req.params.range);

    var params = {
        "start": 'geo!'+coords[0]+','+coords[1],
        "range": range
    }

    // Merge with defaults
    var query = Object.assign({}, appParams, routingParams, params);

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
                .json(data)
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ONE isoline'
                // });
        })
        .catch(function (err) {
            return next(err);
        });

    /*
    // Request + bluebird
    request.getAsync({
        url: config.here.isoline_base,
        qs: query,
        method: 'GET'
    })
    .spread(function (response, body) {
        if (response.statusCode != 200)
            throw new Error('Unsuccessful attempt. Code: ' + response.statusCode);
        return JSON.parse(body);
    })
    .then(function (data) {

        res.status(200)
            .json(data)
            // .json({
            //     status: 'success',
            //     data: data,
            //     message: 'Retrieved ONE isoline'
            // });
    })
    .catch(function (err) {
        return next(err);
    });*/
}


/////////////
// Exports
/////////////

module.exports = {
    getIsoline: getIsoline
};
