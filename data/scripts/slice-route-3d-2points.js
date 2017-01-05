var config = require('./../../config');
var utils = require('./../../utils/index');
var fs = require('fs');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var turf = require('turf');

// Example route from valledupar
var route = {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-73.0106091,10.310154],[-73.03495049999998,10.3170803]]}}

// Chunks config
var chunkLength = 0.01;
var chunkUnit = 'kilometers';

// Use geoprocessing's sliceLine3D function
utils.geo.sliceRoute3D(route, chunkLength, chunkUnit)
    .then (function (slicedPolys) {
        console.log("File saved!");
        var fc = turf.featureCollection(slicedPolys);
        fs.writeFileSync('../road_sliced_3d_2points.json', JSON.stringify(fc));
    })
    .catch(function (err) { console.log('Something went wrong: ' + err); });
