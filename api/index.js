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

// FOS OSM
router.get('/api/fos/place/:id', db.getFOSByPlaceID);
router.get('/api/fos/place/:id/:buffer', db.getFOSByPlaceID);

router.get('/api/fos/road/:id', db.getFOSByRoadID);
router.get('/api/fos/road/:id/:buffer', db.getFOSByRoadID);

// FOS

// one point + buffer
router.get('/api/fos/:coords', db.getFOSByCoords);
router.get('/api/fos/:coords/:buffer', db.getFOSByCoords);

// between 2 points + buffer
router.get('/api/fos/points/:coords1/:coords2', db.getFOSByPoints);
router.get('/api/fos/points/:coords1/:coords2/:buffer', db.getFOSByPoints);

// linestring + buffer
router.get('/api/fos/line/:coords', db.getFOSByLineString);
router.get('/api/fos/line/:coords/:buffer', db.getFOSByLineString);


//////////////
// HERE API
//////////////

var here = require('./here');

// Isolines
router.get('/api/isoline/:center/:coords/:range', here.getIsoline);
router.get('/api/isoline/:coords/:range', here.getIsoline);

// Routes
router.get('/api/route/:start/:end', here.calculateRoute);

module.exports = router;
