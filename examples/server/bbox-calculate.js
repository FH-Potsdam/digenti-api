var turf = require('turf');
var fs = require('fs')

var contents = fs.readFileSync('../../data/poblaciones_dane_2012_aoi.geojson');
var data = JSON.parse(contents);

var resultFeatures = JSON.parse(contents).features;

for (var i=0; i<data.features.length; i++) {

    var input = data.features[i];
    var bbox = turf.bbox(input);

    console.log("name: " + input.properties.nombre + ", bbox: " + bbox);

    var bboxPolygon = turf.bboxPolygon(bbox);

    bboxPolygon.properties = input.properties;

    resultFeatures = resultFeatures.concat(bboxPolygon);
}

var result = {
  "type": "FeatureCollection",
  "features": resultFeatures
};

fs.writeFileSync('../../data/poblaciones_dane_2012_aoi_bbox.geojson', JSON.stringify(result));
