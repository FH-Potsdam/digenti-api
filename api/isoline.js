var config = require('./../config');
var request = require('request');
var qs = require('querystring');
var fs = require('fs')

var base = 'https://isoline.route.cit.api.here.com/routing/7.2/calculateisoline.json';


module.exports = function (routingParams, callback, error) {

    var params = {
        app_id: config.here.app_id,
        app_code: config.here.app_code,
        mode: 'fastest;car',
        start: 'geo!52.51578,13.37749',
        range: 4000,
        rangetype: 'distance'
    };

    params = Object.assign(params, routingParams); // merge two arrays
    var paramsStr = qs.stringify(params);

    console.log("Requesting an Isoline...");
    console.log("Params: " + paramsStr);

    request.get(base + '?' + paramsStr, function (err, response, data) {

        // Error handling
        if (error)
            return error(err);
        else if (response.statusCode != 200)
            return error("Error " + response.statusCode);

        onIsolineResult(data);
    });
}

// Define a callback function to process the isoline response.
var onIsolineResult = function(result) {

    console.log(result);

    /*var coordArray = result.Response.isolines[0].value;
    coordArray = transformHEREgeometry(coordArray);

    var poly = {
      "type": "Feature",
      "properties": {
          "objectID": objectID
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [coordArray]
      }
    };

    var pt1 = {
      "type": "Feature",
      "properties": {
        "marker-color": "#f00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": coordinates
      }
    };

    var poly_buffered = turf.buffer(poly, 500, "meters");
    // console.log(poly_buffered);

    var isInside1 = turf.inside(pt1, poly_buffered.features[0]);
    // console.log(isInside1);

    //isolinesGroup.append("polygon")

    if (isInside1) {

        var concave = concaveman(coordArray, 3);
        var concaveFeature = turf.polygon([concave]);

        console.log(JSON.stringify(concaveFeature));

        // Add concave polygon
        map.addSource(objectID + "_concave", {
            'type': 'geojson',
            'data': concaveFeature
        });

        map.addLayer({
            'id': 'isoline_'+objectID+"_concave",
            'type': 'fill',
            'source': objectID + "_concave",
            'layout': {},
            'paint': {
                'fill-color': '#f00',
                'fill-opacity': 0.1
            }
        });

        // Add original polygon
        map.addSource(objectID, {
            'type': 'geojson',
            'data': poly
        });

        map.addLayer({
            'id': 'isoline_'+objectID,
            'type': 'fill',
            'source': objectID,
            'layout': {},
            'paint': {
                'fill-color': '#009',
                'fill-opacity': 0.1
            }
        });

        // Roads
        var bufferedRoads = null;

        // Buffer all roads in AOI
        for (var i=0; i<roadsData.features.length; i++) {

            var road = roadsData.features[i];
            var buffered = turf.buffer(road, 10, 'meters');

            var bufferedRoad = buffered.features[0];
            // console.log("road: " + i + ", " + JSON.stringify(bufferedRoad));

            // Calculate union
            if (bufferedRoads == null) {
                bufferedRoads = bufferedRoad;
            } else {
                bufferedRoads = turf.union(bufferedRoads, bufferedRoad);
            }
        }

        var newIsodistance = turf.intersect(bufferedRoads, concaveFeature);

        newIsodistance = turf.buffer(newIsodistance, 250, "meters");

        // Add isolines polygon
        map.addSource(objectID + "_roads", {
            'type': 'geojson',
            'data': newIsodistance
        });

        map.addLayer({
            'id': 'isoline_'+objectID+"_roads",
            'type': 'fill',
            'source': objectID + "_roads",
            'layout': {},
            'paint': {
                'fill-color': '#088',
                'fill-opacity': 0.2
            }
        });
    }*/
};
