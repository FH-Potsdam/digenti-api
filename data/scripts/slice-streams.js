// requirements
var fs = require('fs');
var turf = require('turf');
turf.lineChunk = require('turf-line-chunk');
turf.featurecollection = require('turf-featurecollection');


// open the input json-file
var inputJSON = require('../streams_aoi');

// this array holds out points
var points = [];

// loop through the
//for (var i=0; i<1; i++) {
for (var i=0; i<inputJSON.features.length; i++) {

    // current line
    var line = inputJSON.features[i];

    // properties for the point
    var props = {};
    props.streamorder = line.properties.streamorder.toString();
    props.IX = line.properties.IX.toString();
    props.ribtoIX = Math.round(line.properties.tribtoIX).toString();


    // create a featureCollection with the lineChunks
    var lineChunks = turf.lineChunk(line, 1.0, 'kilometers');

    var endPointCoords = [];

    // push startpoint of first chunk
    endPointCoords.push(lineChunks.features[0].geometry.coordinates[0]);
    // push endpoint of all chunks
    for (var j=0; j<lineChunks.features.length; j++) {
        endPointCoords.push(lineChunks.features[j].geometry.coordinates[0]);
    }

    // loop through the lineChunks
    for (var j=0; j<endPointCoords.length; j++) {

        //
        props.id = line.properties.IX.toString()+"_"+(j+1);

        // create turf point object with coordinates and properties
        var p = turf.point(
            endPointCoords[j],
            JSON.parse(JSON.stringify(props))
        );

        // push point object in array
        points.push(p);

    }
}

// make a featureCollection with the points
var feature_collection = turf.featurecollection(points);

fs.writeFileSync('../streams_sliced.json', JSON.stringify(feature_collection));
