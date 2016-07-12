var express = require('express');
var router = express.Router();

// PostGres API
var db = require('./postgres');
router.get('/api/places', db.getAllPlaces);
router.get('/api/places/:id', db.getPlace);

// HERE API
var here = require('./here');
router.get('/api/isoline/:coords/:range', here.getIsoline);

// HERE API
// Comming soon.

module.exports = router;
