var turf = require('turf');
var fs = require('fs')

var unit = 'meters',
    buffer = 500;

var roadsContents = fs.readFileSync('../../data/roads_aoi.json');
var roadsData = JSON.parse(roadsContents);

var resultFeatures = [];
// var resultFeatures = JSON.parse(roadsContents).features;

for (var i=0; i<roadsData.features.length; i++) {

    var road = roadsData.features[i];
    var bufferedRoad = turf.buffer(road, buffer, unit);

    resultFeatures = resultFeatures.concat(bufferedRoad);
}

var result = turf.featureCollection(resultFeatures);

fs.writeFileSync('../../data/roads_aoi_buffer_500.json', JSON.stringify(result));

// console.log(JSON.stringify(result));
