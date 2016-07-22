var config = require('./../config');
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + config.db.host + ':' + config.db.port + '/' + config.db.name;
var db = pgp(connectionString);

var turf = require('turf');

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

//////////////////////
// ROADS Functions
//////////////////////

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
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID((SELECT geom FROM places_aoi_2d WHERE osm_id = '"+placeID+"' LIMIT 1), 4326), "+bufferGrad+") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
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
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+point+"'), 4326), "+bufferGrad+") AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
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
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint("+coords1[1]+","+coords1[0]+"), ST_MakePoint("+coords2[1]+","+coords2[0]+")), 4326), "+bufferGrad+", 'quad_segs=2') AS geom \
            		) \
            		SELECT \
            		    p.gid AS uid, fos.gid AS gid, dn, \
            		    ST_Intersection(fos.geom, p.geom) AS geom \
            		FROM polygons AS p, " + config.db.tables.fos + " AS fos \
            		WHERE ST_Intersects(p.geom, fos.geom) AND fos.dn < 4 \
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

// api/fos/linestring/:coords/:buffer
/*function getFOSByLineString(req, res, next) {
    var coords = (req.params.coords).split(","),
        buffer = (typeof req.params.buffer !== 'undefined') ? parseInt(req.params.buffer) : 100;

    // Convert to Grads (0.01 = 1200m)
    var bufferGrad = 0.01*(buffer/1200);

    // PostGIS MultiLineString
    var multiLineString = "MULTILINESTRING((-73.1193002 10.392685,-73.1187244 10.3927948,-73.1184567 10.3927543,-73.1174436 10.3923976,-73.1156536 10.3917181,-73.1152648 10.3917321,-73.1150064 10.3918484,-73.1148181 10.3919798,-73.1130882 10.3938684,-73.1127933 10.3941037,-73.1124642 10.3942961,-73.1115344 10.3946497,-73.1099948 10.3951686,-73.1080007 10.3958975,-73.1063426 10.3964609,-73.1057754 10.3965745,-73.1051873 10.396577,-73.1034086 10.396505,-73.1012982 10.3963474,-73.1001229 10.3963258,-73.0996326 10.3962838,-73.099266 10.396065,-73.0989064 10.3957945,-73.0978406 10.3949253,-73.096366 10.3936636,-73.0957352 10.3927261,-73.0952143 10.3919819,-73.0945221 10.3910198,-73.0941837 10.3908059,-73.0939245 10.3907097,-73.093402 10.3906046,-73.0926095 10.3905041,-73.0922547 10.39052,-73.0918945 10.3905797,-73.0902082 10.391622,-73.0895366 10.391894,-73.0890621 10.3920365,-73.0885896 10.3920207,-73.0880806 10.3918595,-73.0878225 10.3918484,-73.0875435 10.3919029,-73.0867331 10.3922305,-73.0849304 10.3929676,-73.0829826 10.3937382,-73.0819581 10.3941431,-73.0813363 10.3942292,-73.0803731 10.3942215,-73.0790519 10.3942599,-73.0779843 10.3940754,-73.0762993 10.3933495,-73.0756481 10.393307,-73.0748566 10.3934293,-73.0742048 10.3934469,-73.0737324 10.393348,-73.0733865 10.393213,-73.0730442 10.3929218,-73.0711383 10.3916249,-73.0699212 10.3908501,-73.0673284 10.3898829,-73.0644604 10.388845,-73.0631847 10.3884261,-73.0620145 10.3881484,-73.0605768 10.3877433,-73.0600158 10.3878033,-73.0579562 10.3884983,-73.0575886 10.3885433,-73.0570801 10.3884102,-73.0562022 10.3880667,-73.0554388 10.3876172,-73.0550943 10.3876379,-73.0547884 10.3877464,-73.0541388 10.3880026,-73.0533976 10.3880671,-73.0525879 10.3880233,-73.0521353 10.387915,-73.0518352 10.3877866,-73.0516451 10.3877788,-73.0514761 10.387913,-73.0510242 10.3882674,-73.0503833 10.388503,-73.049819 10.388417,-73.0493742 10.3884307,-73.0491788 10.3885597,-73.0490171 10.3887384,-73.0487681 10.3893948,-73.0485885 10.3896553,-73.0479893 10.3904264,-73.0476037 10.3908612,-73.0473571 10.3909847,-73.0470429 10.3910895,-73.0466948 10.3911451,-73.0463112 10.3910718,-73.0457928 10.3908306,-73.0453893 10.390713,-73.0447761 10.3906679,-73.0432778 10.3907201,-73.0425232 10.3906679,-73.0418612 10.3906028,-73.0414472 10.3905868,-73.0409645 10.3907115,-73.0406126 10.3908474,-73.0402084 10.3910341,-73.0395367 10.3914569,-73.0386463 10.3920791,-73.0383488 10.392202,-73.0380262 10.3922123,-73.0376905 10.3922149,-73.0354941 10.3920845,-73.0335358 10.3920077,-73.0326815 10.3919741,-73.031936 10.3919449,-73.0310134 10.3918976,-73.0308374 10.3917963,-73.0307283 10.3916717,-73.0304406 10.391049,-73.0299985 10.3900918,-73.0295921 10.3892121,-73.0295435 10.3891113,-73.0293026 10.3886114))"
    //var point = "POINT("+coords[1]+" "+coords[0]+")";

    console.log("Get FOS values for line " + req.params.coords + " within buffer of " + buffer + " m");

    db.any("SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
             FROM (SELECT 'Feature' As type \
                , row_to_json((SELECT l FROM (SELECT gid as id, dn as fos) As l \
                  )) As properties \
                , ST_AsGeoJSON(lg.geom)::json As geometry \
               FROM ( \
            		WITH polygons AS (SELECT \
            		    1 AS gid, \
            		    ST_Buffer(ST_SetSRID(ST_GeomFromText('"+multiLineString+"'), 4326), "+bufferGrad+", 'quad_segs=2') AS geom \
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
                query: 'fos/line',
                coords: req.params.coords,
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
}*/

/////////////
// Exports
/////////////

module.exports = {
    getAllPlaces: getAllPlaces,
    getPlace: getPlace,
    getAllRoads: getAllRoads,
    getRoad: getRoad,
    getFOSByPlaceID: getFOSByPlaceID,
    getFOSByRoadID: getFOSByRoadID,
    getFOSByCoords: getFOSByCoords,
    getFOSByPoints: getFOSByPoints,
    getFOSByLineString: getFOSByLineString
};
