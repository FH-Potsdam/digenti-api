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

// FOS
router.get('/api/fos/place/:id/', db.getFOSByPlaceID);
router.get('/api/fos/place/:id/:radius', db.getFOSByPlaceID);


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
