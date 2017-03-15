/////////////////////////
// GeoJSON Utils
/////////////////////////

var geojson = {};
var turf = require('turf');

geojson.filter = function(collection, key, val) {
  var newFC = turf.featureCollection([]);
  for(var i = 0; i < collection.features.length; i++) {
    if(collection.features[i].properties[key] === val) {
      newFC.features.push(collection.features[i]);
    }
  }
  return newFC;
};

// export geojson
module.exports = geojson;
