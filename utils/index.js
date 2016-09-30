var utils = {};

// Array utils
var array = require('./array');
utils.array = array;

// HERE utils
var here = require('./here');
utils.here = here;

// GEOPROCESSING utils
var geo = require('./geoprocessing');
utils.geo = geo;

// cache utils
var cache = require('./cache');
utils.cache = cache;

module.exports = utils;
