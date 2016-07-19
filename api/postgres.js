var config = require('./../config');
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + config.db.host + ':' + config.db.port + '/' + config.db.name;
var db = pgp(connectionString);


//////////////////////
// PLACES Functions
//////////////////////

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


///////////////////
// FOS Functions
///////////////////

// api/fos/place/:id/:radius
function getFOSByPlaceID(req, res, next) {
    var placeID = parseInt(req.params.id),
        radius = (typeof req.params.radius !== 'undefined') ? parseInt(req.params.radius) : 1200;

    console.log("Get FOS values for settlement with ID " + placeID + " within radius of " + radius + " m");

    // Convert to Grads (0.01 = 1200m)
    radius = 0.01*(radius/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID((SELECT geom FROM places_aoi_2d WHERE gid = " + placeID + " LIMIT 1), 4326), " + radius + ") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, colombia_fos_roi_h5_m0 AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 5 \
               ) As lg ) As f;")
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

/////////////
// Exports
/////////////

module.exports = {
    getAllPlaces: getAllPlaces,
    getPlace: getPlace,
    getFOSByPlaceID: getFOSByPlaceID,
};
