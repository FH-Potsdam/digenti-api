var turf = require('turf');

// Calculate area of a Polygon
var polygon = {"type": "Polygon","coordinates": [[[-73.04431915283203,10.394792706073337],[-73.04723739624023,10.380102928571908],[-73.02629470825195,10.378583257023841],[-73.01651000976561,10.385168447070184],[-73.04431915283203,10.394792706073337]]]}
console.log("area polygon: " + turf.area(polygon));


// Calculate area of a FeatureCollection
var fc = turf.featureCollection([turf.feature(polygon)]);
console.log("area fc: " + turf.area(fc));

//
// var fc = turf.featureCollection([turf.feature(polygon), turf.feature(polygon)]);

// Calculate area of a FeatureCollection
var polygons = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-67.031021, 10.458102],
          [-67.031021, 10.53372],
          [-66.929397, 10.53372],
          [-66.929397, 10.458102],
          [-67.031021, 10.458102]
        ]]
      }
    }
  ]
};

var area = turf.area(polygons);
console.log("area polygons: " + area);
