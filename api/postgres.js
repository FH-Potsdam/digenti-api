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
    // var placeID = parseInt(req.params.id),
    var placeID = req.params.id,
        radius = (typeof req.params.radius !== 'undefined') ? parseInt(req.params.radius) : 1200;

    console.log("Get FOS values for settlement with ID " + placeID + " within radius of " + radius + " m");

    // Convert to Grads (0.01 = 1200m)
    var radiusGrad = 0.01*(radius/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID((SELECT geom FROM places_aoi_2d WHERE osm_id = '"+placeID+"' LIMIT 1), 4326), "+radiusGrad+") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, colombia_fos_roi_h5_m0 AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/place',
                osm_id: placeID,
                radius: radius,
                intersection: 'yes'
            };

            res.status(200)
                .json(fc);
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

// api/fos/:coords/:radius
function getFOSByCoords(req, res, next) {
    var coords = (req.params.coords).split(","),
        radius = (typeof req.params.radius !== 'undefined') ? parseInt(req.params.radius) : 1200;

    // Convert to Grads (0.01 = 1200m)
    var radiusGrad = 0.01*(radius/1200);

    // PostGIS Point
    var point = "POINT("+coords[1]+" "+coords[0]+")";

    console.log("Get FOS values from " + req.params.coords + " within radius of " + radius + " m");

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+point+"'), 4326), "+radiusGrad+") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, colombia_fos_roi_h5_m0 AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos',
                coords: req.params.coords,
                radius: radius,
                intersection: 'yes'
            };

            res.status(200)
                .json(fc);
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

// api/fos/line/:coords/:radius
function getFOSByLineString(req, res, next) {
    var coords = (req.params.coords).split(","),
        radius = (typeof req.params.radius !== 'undefined') ? parseInt(req.params.radius) : 100;

    // Convert to Grads (0.01 = 1200m)
    var radiusGrad = 0.01*(radius/1200);

    // PostGIS MultiLineString
    var multiLineString = "MULTILINESTRING((-73.1325633113342 10.3931487718127,-73.1320262 10.3933828,-73.1314668 10.3935777,-73.1305125 10.3938044,-73.1296182 10.3939888,-73.1286469 10.3942119,-73.1282239 10.3943215,-73.127887 10.394442,-73.1269516 10.3948444,-73.126573 10.395015,-73.1263691 10.3950503,-73.1260527 10.3950192,-73.1252879 10.394613,-73.1248997 10.3943801,-73.123967 10.3938813,-73.1234689 10.3936618,-73.1227464 10.3932596,-73.1220156 10.3928683,-73.1211463 10.3925318,-73.1208274 10.3924779,-73.1205395 10.3924554,-73.119823 10.3925494))"
    //var point = "POINT("+coords[1]+" "+coords[0]+")";

    console.log("Get FOS values for line " + req.params.coords + " within radius of " + radius + " m");

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT gid as id, dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM ( \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+multiLineString+"'), 4326), "+radiusGrad+", 'quad_segs=2') AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    fos.geom AS geom \
            		FROM polygons AS p, colombia_fos_roi_h5_m0 AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/line',
                coords: req.params.coords,
                radius: radius,
                intersection: 'no'
            };

            res.status(200)
                .json(fc);
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
    getFOSByCoords: getFOSByCoords,
    getFOSByLineString: getFOSByLineString
};
