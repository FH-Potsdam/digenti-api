var turf = require('turf');
var fs = require('fs')

var unit = 'meters',
    buffer = 500;

var roadsContents = fs.readFileSync('../../data/roads_aoi.json');
var roadsData = JSON.parse(roadsContents);
var union = null;

for (var i=0; i<roadsData.features.length; i++) {

    var road = roadsData.features[i];
    var bufferedRoad = turf.buffer(road, buffer, unit);

    if (union == null) {
        union = bufferedRoad;
    } else if (bufferedRoad != undefined) {
        union = turf.union(union, bufferedRoad);
    }
}

var result = turf.featureCollection([union]);

fs.writeFileSync('../../data/roads_aoi_buffer_500_union.json', JSON.stringify(result));

// console.log(JSON.stringify(result));
