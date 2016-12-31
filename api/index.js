var express = require('express');
var router = express.Router();


// Say hello on the API "/" http://localhost:61002/api/
router.get('/api', function(req, res, next) {
    res.status(200)
      .json({
        status: 'success',
        message: 'Live long and prosper!'
      });
});


//////////////////
// PostGres API
//////////////////

var db = require('./postgres');

// Places
router.get('/api/places', db.getAllPlaces);
router.get('/api/places/:id', db.getPlace);

// Roads
router.get('/api/roads', db.getAllRoads);
router.get('/api/roads/:id', db.getRoad);

/////////////////////
// Elevation - DEM
/////////////////////

router.get('/api/elevation/point/:coords', db.getElevationByCoords);

/////////
// FOS
/////////

// one point + buffer
router.get('/api/fos/point/:coords', db.getFOSByCoords);
router.get('/api/fos/point/:coords/:buffer', db.getFOSByCoords);

// between 2 points + buffer
router.get('/api/fos/points/:coords1/:coords2', db.getFOSByPoints);
router.get('/api/fos/points/:coords1/:coords2/:buffer', db.getFOSByPoints);

// FOS OSM
router.get('/api/fos/place/:id', db.getFOSByPlaceID);
router.get('/api/fos/place/:id/:buffer', db.getFOSByPlaceID);

router.get('/api/fos/road/:id', db.getFOSByRoadID);
router.get('/api/fos/road/:id/:buffer', db.getFOSByRoadID);

// linestring + buffer
// router.get('/api/fos/linestring', db.getFOSByLineString);

//////////////////////
// Special Areas
// (NDVI - Gradient)
//////////////////////

// OSM place + buffer
router.get('/api/specialareas/:ndvi/:gradient/place/:id', db.getSpecialAreasByPlaceID);
router.get('/api/specialareas/:ndvi/:gradient/place/:id/:buffer', db.getSpecialAreasByPlaceID);

// OSM road + buffer
router.get('/api/specialareas/:ndvi/:gradient/road/:id', db.getSpecialAreasByRoadID);
router.get('/api/specialareas/:ndvi/:gradient/road/:id/:buffer', db.getSpecialAreasByRoadID);

// one point + buffer
router.get('/api/specialareas/:ndvi/:gradient/point/:coords', db.getSpecialAreasByCoords);
router.get('/api/specialareas/:ndvi/:gradient/point/:coords/:buffer', db.getSpecialAreasByCoords);

// between 2 points + buffer
router.get('/api/specialareas/:ndvi/:gradient/points/:coords1/:coords2', db.getSpecialAreasByPoints);
router.get('/api/specialareas/:ndvi/:gradient/points/:coords1/:coords2/:buffer', db.getSpecialAreasByPoints);



//////////////
// HERE API
//////////////

var here = require('./here');

// Isolines
router.get('/api/isoline/:center/:coords/:range', here.getIsoline);
router.get('/api/isoline/:coords/:range', here.getIsoline);

// Routes
router.get('/api/route/:start/:end', here.calculateRoute);
//router.get('/api/routes/:start/:end', here.calculateRoute);
//router.post('/api/routes/onetomany/:start/', here.calculateRoute);

module.exports = router;


///////////////////////
// GEOPROCESSING API
///////////////////////

var geoprocessing = require('./geoprocessing');

router.post('/api/geoprocessing/routeparts', geoprocessing.calculateRouteParts);
