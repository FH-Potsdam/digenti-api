///////////////////
// PostGRE Utils
///////////////////

var postgres = {};

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var config = require('./../config');
var turf = require('turf');

const rp = require('request-promise');


//////////////////////////
// Elevation Functions
//////////////////////////

postgres.getElevationByPoint = async (function(point) {

    var coords = point.geometry.coordinates;

    // Request
    var options = {
        method: 'GET',
        uri: 'http://localhost:' + config.server.port + '/api/elevation/point/' + coords[1] + ',' + coords[0],
        // qs: query,
        // simple: false,
        json: true
    };

    // console.log(options.uri);

    try {
        const response = await (rp(options));
        return response.properties.elevation;
    }
    catch (error) {
        console.log("error catched!");
        return 0;
    }
});

// postgres.getElevationByPoint = async (function(point) {
//
//     var coords = point.geometry.coordinates;
//
//     // PostGIS Point
//     var point = "POINT("+coords[1]+" "+coords[0]+")";
//
//     await db.any("WITH point AS (SELECT \
//             	1 AS gid, \
//             	ST_SetSRID(ST_GeomFromText('"+point+"'), 4326) AS geom \
//             ) \
//             SELECT ST_Value(rast, p.geom) as elevation \
//             FROM point as p, colombia_aoi_tandem \
//             WHERE ST_Intersects(rast, p.geom);")
//         .then(function (data) {
//             var elevation = (typeof data[0] !== 'undefined') ? data[0].elevation : 0;
//             // console.log("elevation: " + elevation);
//             return elevation;
//         })
//         .catch(function (err) {
//             return 0;
//             // return next(err);
//         });
// });


// export postgres
module.exports = postgres;
