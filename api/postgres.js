var config = require('./../config');
var utils = require('./../utils/index');
var turf = require('turf');

var promise = require('bluebird');
var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + config.db.host + ':' + config.db.port + '/' + config.db.name;
var db = pgp(connectionString);


///////////////////
// OSM Functions
///////////////////

// api/places
function getAllPlaces(req, res, next) {
    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
              FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT osm_id, name, type) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
              FROM places_aoi_2d As lg ) As f;")
        .then(function (data) {
            // Response
            res.status(200)
                .json(data[0]);
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
            FROM places_aoi_2d As lg WHERE osm_id = '"+placeID+"' LIMIT 1;")
        .then(function (data) {
            // Response
            res.status(200)
                .json(data[0]);
        })
        .catch(function (err) {
            return next(err);
        });
}


// api/roads
function getAllRoads(req, res, next) {
    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
              FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT osm_id, name, type) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
              FROM roads_aoi_2d As lg ) As f;")
        .then(function (data) {
            // Response
            res.status(200)
                .json(data[0]);
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/roads/:id
function getRoad(req, res, next) {
    var roadID = parseInt(req.params.id);
    db.any("SELECT 'Feature' As type \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
                , row_to_json((SELECT l FROM (SELECT osm_id, name, type) As l \
            )) As properties \
            FROM roads_aoi_2d As lg WHERE osm_id = '"+roadID+"' LIMIT 1;")
        .then(function (data) {
            // Response
            res.status(200)
                .json(data[0]);
        })
        .catch(function (err) {
            return next(err);
        });
}


//////////////////////////
// Elevation Functions
//////////////////////////

// api/elevation/point/:coords/
function getElevationByCoords(req, res, next) {

    var coords = (req.params.coords).split(",");

    // PostGIS Point
    var point = "POINT("+coords[1]+" "+coords[0]+")";

    console.log("Get ELEVATION from " + req.params.coords);

    db.any("WITH point AS (SELECT \
            	1 AS gid, \
            	ST_SetSRID(ST_GeomFromText('"+point+"'), 4326) AS geom \
            ) \
            SELECT ST_Value(rast, p.geom) as elevation \
            FROM point as p, colombia_aoi_tandem \
            WHERE ST_Intersects(rast, p.geom);")
        .then(function (data) {

            var elevation = (typeof data[0] !== 'undefined') ? data[0].elevation : 0;

            // Return a GeoJSON point
            // Elevation in "elevation" parameter
            var pt = turf.point(
                            [parseFloat(coords[1]), parseFloat(coords[0])],
                            {
                                elevation: elevation,
                                units: 'meters'
                            })
            res.status(200)
                .json(pt); // format '{elevation: 750}', where elev is given in meters
        })
        .catch(function (err) {
            return next(err);
        });
}

function getProfileBetween2Points(req, res, next) {

    var coords1 = (req.params.coords1).split(",").map(parseFloat),
        coords2 = (req.params.coords2).split(",").map(parseFloat);

    var start = [coords1[1], coords1[0]],
        end = [coords2[1], coords2[0]];

    var routeFeature = turf.lineString([start, end]);

    console.log(JSON.stringify(routeFeature));

    var response = [];

    // Add LineString route in the first position
    response.push(routeFeature);

    // Use geoprocessing's sliceLine3D function
    utils.geo.sliceRoute3D(routeFeature, config.profile.resolution / 1000, 'kilometers')
        .then (function (slicedPolys) {

            var fc = turf.featureCollection(slicedPolys);

            response.push(fc);

            // cache route JSON
            // utils.cache.writeCacheFile(file, response);
            // res.status(200).json(response)

            fc.properties = {
                query: 'profile/points',
                start: start,
                end: end
            };

            res.status(200).json(fc)
        })
        .catch(function (err) {
            console.log('Something went wrong: ' + err);
            return next(err);
        });
}


///////////////////
// FOS Functions
///////////////////

// api/fos/point/:coords/:buffer
function getFOSByCoords(req, res, next) {
    var coords = (req.params.coords).split(","),
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    // PostGIS Point
    var point = "POINT("+coords[1]+" "+coords[0]+")";

    console.log("Get FOS values from " + req.params.coords + " within buffer of " + buffer + " m");

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
                   SELECT gid, dn, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+point+"'), 4326), "+bufferGrad+") AS geom \
                		) \
                		SELECT \
                		    p.gid AS uid, fos.gid AS gid, dn, \
                		    ST_Intersection(fos.geom, p.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
                		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
                   ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/point',
                coords: req.params.coords,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/fos/points/:coords1/:coords2/:buffer
function getFOSByPoints(req, res, next) {
    var coords1 = (req.params.coords1).split(","),
        coords2 = (req.params.coords2).split(","),
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 100;

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    // Get line between two points
    console.log("Get FOS values between point 1 (" + req.params.coords1 + ") and point 2 (" + req.params.coords2 + ") within buffer of " + buffer + " m");
    console.log("---------- FOS table: " + config.db.tables.fos);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT gid as id, dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM ( \
                   SELECT gid, dn, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint("+coords1[1]+","+coords1[0]+"), ST_MakePoint("+coords2[1]+","+coords2[0]+")), 4326), "+bufferGrad+", 'quad_segs=2') AS geom \
                		) \
                		SELECT \
                		    p.gid AS uid, fos.gid AS gid, dn, \
                		    ST_Intersection(fos.geom, p.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
                		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
                    ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/points',
                coords1: req.params.coords1,
                coords2: req.params.coords2,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/fos/linestring
function getFOSByLineString(req, res, next) {

    var feature = JSON.parse(req.query.data);

    console.log("type:" + feature.type);

    res.status(200)
      .json(feature);
}


////////////////////////////////////
// FOS Functions for OSM Features
////////////////////////////////////

// api/fos/place/:id/:buffer
function getFOSByPlaceID(req, res, next) {
    // var placeID = parseInt(req.params.id),
    var placeID = req.params.id,
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    console.log("Get FOS values for settlement with ID " + placeID + " within buffer of " + buffer + " m");

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
                   SELECT gid, dn, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID((SELECT geom FROM places_aoi_2d WHERE osm_id = '"+placeID+"' LIMIT 1), 4326), "+bufferGrad+") AS geom \
                		) \
                		SELECT \
                		    p.gid AS uid, fos.gid AS gid, dn, \
                		    ST_Intersection(fos.geom, p.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
                		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
                    ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/place',
                osm_id: placeID,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/fos/road/:id/:buffer
function getFOSByRoadID(req, res, next) {
    var roadID = req.params.id,
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    console.log("Get FOS values for road with ID " + roadID + " within buffer of " + buffer + " m");

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID((SELECT geom FROM roads_aoi_2d WHERE osm_id = '"+roadID+"' LIMIT 1), 4326), "+bufferGrad+") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    fos.geom AS geom \
            		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/road',
                osm_id: roadID,
                buffer: buffer,
                intersection: 'no'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}


/////////////////////////////////////////////////////////////////
// Special Areas (NDVI - Gradient) Functions for OSM Features
/////////////////////////////////////////////////////////////////

// api/specialareas/:ndvi/:gradient/place/:id/:buffer
function getSpecialAreasByPlaceID(req, res, next) {
    // var placeID = parseInt(req.params.id),
    var placeID = req.params.id,
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    // Special areas
    var ndvi = req.params.ndvi,
        gradient = req.params.gradient;

    console.log("Get Special Areas values for settlement with ID " + placeID + " within buffer of " + buffer + " m.");
    console.log("  -- NDVI threshold: (" + ndvi + ") " + utils.strings.ndvi[ndvi-1] + ", Gradient threshold: (" + gradient + ") " + utils.strings.gradient[gradient-1]);

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT ndvi, gradient) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
                   SELECT ndvi, gradient, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID((SELECT geom FROM places_aoi_2d WHERE osm_id = '"+placeID+"' LIMIT 1), 4326), "+bufferGrad+") AS geom \
                		) \
                		SELECT DISTINCT \
                            area.ndvi AS ndvi, area.gradient AS gradient, \
                		    ST_Intersection(p.geom, area.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.specialareas + " AS area \
                		WHERE ST_Intersects(p.geom, area.geom) AND area.ndvi <= " + ndvi + " AND area.gradient <= " + gradient + " \
                    ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'specialareas/place',
                osm_id: placeID,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/specialareas/:ndvi/:gradient/road/:id/:buffer
function getSpecialAreasByRoadID(req, res, next) {
    var roadID = req.params.id,
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    // Special areas
    var ndvi = req.params.ndvi,
        gradient = req.params.gradient;

    console.log("Get Special Areas for road with ID " + roadID + " within buffer of " + buffer + " m");
    console.log("  -- NDVI threshold: (" + ndvi + ") " + utils.strings.ndvi[ndvi-1] + ", Gradient threshold: (" + gradient + ") " + utils.strings.gradient[gradient-1]);

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT ndvi, gradient) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID((SELECT geom FROM roads_aoi_2d WHERE osm_id = '"+roadID+"' LIMIT 1), 4326), "+bufferGrad+") AS geom \
            		) \
            		SELECT DISTINCT \
            		    p.gid AS uid, \
            		    area.ndvi AS ndvi, area.gradient AS gradient, \
            		    area.geom AS geom \
            		FROM polygons AS p, " + config.db.tables.specialareas + " AS area \
            		WHERE ST_Intersects(p.geom, area.geom) AND area.ndvi <= " + ndvi + " AND area.gradient <= " + gradient + " \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'specialareas/road',
                osm_id: roadID,
                buffer: buffer,
                intersection: 'no'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            return next(err);
        });
}


///////////////////////////////////////////////
// Special Areas (NDVI - Gradient) Functions
///////////////////////////////////////////////

// api/specialareas/:ndvi/:gradient/point/:coords/:buffer
function getSpecialAreasByCoords(req, res, next) {

    var coords = (req.params.coords).split(","),
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 1200;

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    // PostGIS Point
    var point = "POINT("+coords[1]+" "+coords[0]+")";

    // Special areas
    var ndvi = req.params.ndvi,
        gradient = req.params.gradient;

    console.log("Get Special Areas values from " + req.params.coords + " within buffer of " + buffer + " m");
    console.log("  -- NDVI threshold: (" + ndvi + ") " + utils.strings.ndvi[ndvi-1] + ", Gradient threshold: (" + gradient + ") " + utils.strings.gradient[gradient-1]);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT ndvi, gradient) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
                   SELECT ndvi, gradient, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+point+"'), 4326), "+bufferGrad+") AS geom \
                		) \
                		SELECT DISTINCT \
                            area.ndvi AS ndvi, area.gradient AS gradient, \
                		    ST_Intersection(p.geom, area.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.specialareas + " AS area \
                		WHERE ST_Intersects(p.geom, area.geom) AND area.ndvi <= " + ndvi + " AND area.gradient <= " + gradient + " \
                    ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'specialareas/point',
                coords: req.params.coords,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
        })
        .catch(function (err) {
            console.log("error");
            return next(err);
        });
}

// api/specialareas/:ndvi/:gradient/points/:coords1/:coords2/:buffer
function getSpecialAreasByPoints(req, res, next) {
    var coords1 = (req.params.coords1).split(","),
        coords2 = (req.params.coords2).split(","),
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 100;

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    // Special areas
    var ndvi = req.params.ndvi,
        gradient = req.params.gradient;

    // Get line between two points
    console.log("Get Special Areas values between point 1 (" + req.params.coords1 + ") and point 2 (" + req.params.coords2 + ") within buffer of " + buffer + " m");
    console.log("  -- NDVI threshold: (" + ndvi + ") " + utils.strings.ndvi[ndvi-1] + ", Gradient threshold: (" + gradient + ") " + utils.strings.gradient[gradient-1]);

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT ndvi, gradient) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM (	 \
                    SELECT ndvi, gradient, ST_GeometryN(geom, generate_series(1, ST_NumGeometries(geom))) As geom FROM ( \
                		WITH polygons AS (SELECT \
                		    1 AS gid, \
                		    ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint("+coords1[1]+","+coords1[0]+"), ST_MakePoint("+coords2[1]+","+coords2[0]+")), 4326), "+bufferGrad+", 'quad_segs=2') AS geom \
                		) \
                		SELECT DISTINCT \
                            area.ndvi AS ndvi, area.gradient AS gradient, \
                		    ST_Intersection(p.geom, area.geom) AS geom \
                		FROM polygons AS p, " + config.db.tables.specialareas + " AS area \
                		WHERE ST_Intersects(p.geom, area.geom) AND area.ndvi <= " + ndvi + " AND area.gradient <= " + gradient + " \
                    ) As sp \
               ) As lg ) As f;")
        .then(function (data) {
            var fc = data[0];

            // Add query properties
            fc.properties = {
                query: 'fos/points',
                coords1: req.params.coords1,
                coords2: req.params.coords2,
                buffer: buffer,
                intersection: 'yes'
            };

            // Response
            res.status(200)
                .json(fc);
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
    getAllRoads: getAllRoads,
    getRoad: getRoad,
    getElevationByCoords: getElevationByCoords,
    getProfileBetween2Points: getProfileBetween2Points,
    getFOSByCoords: getFOSByCoords,
    getFOSByPoints: getFOSByPoints,
    getFOSByPlaceID: getFOSByPlaceID,
    getFOSByRoadID: getFOSByRoadID,
    // getFOSByLineString: getFOSByLineString
    getSpecialAreasByPlaceID: getSpecialAreasByPlaceID,
    getSpecialAreasByRoadID: getSpecialAreasByRoadID,
    getSpecialAreasByCoords: getSpecialAreasByCoords,
    getSpecialAreasByPoints: getSpecialAreasByPoints,
};
