var config = require('./../config');
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + config.db.host + ':' + config.db.port + '/' + config.db.name;
var db = pgp(connectionString);


////////////////////
// API Functions
////////////////////

// api/places
function getAllPlaces(req, res, next) {
    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
              FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT osm_id, name, type) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
              FROM places_aoi_2d As lg ) As f;")
        .then(function (data) {
            res.status(200)
                .json(data[0]);
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ALL places'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}
/*function getAllPlaces(req, res, next) {
    db.any('select osm_id, name, type, ST_Y(geom) as lat, ST_X(geom) as lon from places_aoi_2d')
        .then(function (data) {
            res.status(200)
                .json(data);
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ALL places'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}*/

// api/places/:id
function getPlace(req, res, next) {
    var placeID = parseInt(req.params.id);
    db.any("SELECT 'Feature' As type \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
                , row_to_json((SELECT l FROM (SELECT osm_id, name, type) As l \
            )) As properties \
            FROM places_aoi_2d As lg WHERE gid = $1;", placeID)
        .then(function (data) {
            res.status(200)
                .json(data[0]);
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ONE place'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}
/*function getPlace(req, res, next) {
    var placeID = parseInt(req.params.id);
    db.any('select osm_id, name, type, ST_Y(geom) as lat, ST_X(geom) as lon from places_aoi_2d where gid = $1', placeID)
        .then(function (data) {
            res.status(200)
                .json(data);
                // .json({
                //     status: 'success',
                //     data: data,
                //     message: 'Retrieved ONE place'
                // });
        })
        .catch(function (err) {
            return next(err);
        });
}*/


/////////////
// Exports
/////////////

module.exports = {
    getAllPlaces: getAllPlaces,
    getPlace: getPlace
};
