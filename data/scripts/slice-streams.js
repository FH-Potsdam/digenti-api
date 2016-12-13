// requirements
var fs = require('fs');
var turf = require('turf');
turf.lineChunk = require('turf-line-chunk');
turf.featurecollection = require('turf-featurecollection');
var jsonexport = require('jsonexport');

// open the input json-file
var inputJSON = require('../streams_aoi');

var removeDuplicates = true;

// this array holds the points
var points = [];

// loop through the inputJSON
for (var i=0; i<inputJSON.features.length; i++) {

    // current line
    var line = inputJSON.features[i];

    // properties for the point
    var props = {};
    props.streamorder = line.properties.streamorder;
    props.streamID = [line.properties.IX];
    props.followingStreamID = Math.round(line.properties.tribtoIX);

    // create a featureCollection with the lineChunks
    var lineChunks = turf.lineChunk(line, 1.0, 'kilometers');

    // array with the coords of all points
    var pointCoords = [];

    //console.log(lineChunks.features[lineChunks.features.length-1]);

    // push startpoint of first chunk
    //pointCoords.push(lineChunks.features[0].geometry.coordinates[0]);
    // push endpoint of all chunks
    for (var j=0; j<lineChunks.features.length; j++) {
        pointCoords.push(lineChunks.features[j].geometry.coordinates[0]);
    }
    pointCoords.push(lineChunks.features[lineChunks.features.length-1].geometry.coordinates[lineChunks.features[lineChunks.features.length-1].geometry.coordinates.length-1]);

    // loop through the lineChunks
    for (var j=0; j<pointCoords.length; j++) {

        // create unique id based on stream id
        props.id = line.properties.IX.toString()+"_"+(j+1);

        // create turf point object with coordinates and properties
        var p = turf.point(
            pointCoords[j],
            JSON.parse(JSON.stringify(props))
        );

        // push point object in array
        points.push(p);

    }
}



if (removeDuplicates) {

    for (var i=0; i<points.length; i++) {
        for (var j=i+1; j<points.length; j++) {
            if ((points[i].geometry.coordinates[0] === points[j].geometry.coordinates[0]) && (points[i].geometry.coordinates[1] === points[j].geometry.coordinates[1])) {
                if (points[i].properties.streamorder > points[j].properties.streamorder) {
                    points[i].properties.streamID = points[i].properties.streamID.concat(points[j].properties.streamID);
                    points.splice(j, 1);
                } else if (points[i].properties.streamorder < points[j].properties.streamorder) {
                    points[j].properties.streamID = points[j].properties.streamID.concat(points[i].properties.streamID);
                    points.splice(i, 1);
                }
            }
        }
    }

}


// make a featureCollection with the points
var feature_collection = turf.featurecollection(points);

// write json
fs.writeFileSync('../streams_sliced.json', JSON.stringify(feature_collection));

// write csv
jsonexport(feature_collection.features, function(err, csv){
    if(err) return console.log(err);
    fs.writeFileSync('../streams_sliced.csv', csv);
});
