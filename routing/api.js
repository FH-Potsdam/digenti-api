// @codekit-prepend "js/digenti-framework.js"

var config          = require('./../config')
var hereCore        = require('./../lib/here/mapsjs-core.js')
  , hereService     = require('./../lib/here/mapsjs-service.js')

// HERE API
var platform = new H.service.Platform({
  'app_id': config.here.app_id,
  'app_code': config.here.app_code
});

var router = platform.getRoutingService();

// Get an instance of the enterprise routing service:
var enterpriseRouter = platform.getEnterpriseRoutingService();


//////////////
// REST API
//////////////

function init(app) {

  // GET search/tweets
  app.get('routing/isolines/', function(req, res){

    // console.log('"twitter/search/tweets" ' + req.method + ' request received');
    // console.log('   - Params: ' + JSON.stringify(req.query) + '\n');
    //
    // var params = req.query;
    //
    // client.get('search/tweets', params, function(err, tweets, response){
    //   if (err) {
    //     res.statusCode = 400;
    //     return res.send('There was an error: ' + err);
    //   }
    //
    //   // Tweets already come in JSON format
    //   console.log('Returning ' + tweets.statuses.length + ' tweets in JSON format...');
    //   res.json(tweets);
    // });
  });

  // POST search/tweets
  app.post('routing/isolines/', function(req, res){

    // console.log('"twitter/search/tweets" ' + req.method + ' request received');
    // console.log('   - Params: ' + JSON.stringify(req.body) + '\n');
    //
    // var params = req.body;
    //
    // client.get('search/tweets', params, function(err, tweets, response){
    //   if (err) {
    //     res.statusCode = 400;
    //     return res.send('There was an error: ' + err);
    //   }
    //
    //   // Tweets already come in JSON format
    //   console.log('Returning ' + tweets.statuses.length + ' tweets in JSON format...');
    //   res.json(tweets);
    // });
  });
}

module.exports.init = init;


///////////////
// Functions
///////////////

function getIsoline(coordinates, objectID, range) {

    console.log(coordinates);

    var rangeforAPI = (range*1000).toString();

    console.log(rangeforAPI);

    c = 'geo!'+coordinates[1]+','+coordinates[0];

    // Create the parameters for the routing request:
    var routingParams = {
        mode: 'fastest;car',
        resolution: '1',
        maxpoints: '1000',
        rangetype: 'time',
        start: c,
        distance: rangeforAPI
    };

    console.log(c);

    // Call the Enterprise Routing API to calculate an isoline:
    enterpriseRouter.calculateIsoline( routingParams, onIsolineResult, function(error) {
        console.log(error.message);
    });

    // Define a callback function to process the isoline response.
    var onIsolineResult = function(result) {

        console.log(result);

        var coordArray = result.Response.isolines[0].value;
        coordArray = transformHEREgeometry(coordArray);

        console.log(coordArray);

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

        console.log(JSON.stringify(poly));

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
        console.log(poly_buffered);

        var isInside1 = turf.inside(pt1, poly_buffered.features[0]);
        console.log(isInside1);

        //isolinesGroup.append("polygon")

        if (isInside1) {

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
                    'fill-color': '#088',
                    'fill-opacity': 0.1
                }
            });

            /*var isoline = isolinesGroup
                .append("polygon")
                .data([coordArray])
                .attr("class", "isoline")
                .attr("data-refobjectid", objectID);


            $("polygon").hover(
                function() {
                    var idstring = "[data-id='"+$(this).data('refobjectid')+"']";
                    console.log(idstring);
                    $(".village").filter(idstring).addClass("active");
                }
            );

            isolines_collection.push(isoline);

            update();*/


        }


    };
}
