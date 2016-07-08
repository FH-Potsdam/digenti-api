var isochrone = require('osrm-isochrone');

var time = 300; // 300 second drivetime (5 minutes)
var location = [-77.02926635742188,38.90011780426885]; // center point
var options = {
  resolution: 25, // sample resolution
  maxspeed: 70, // in 'unit'/hour
  unit: 'miles', // 'miles' or 'kilometers'
  network: './dc.osrm' // prebuild dc osrm network file
}

isochrone(location, time, options, function(err, drivetime) {
  if(err) throw err;
  // a geojson linestring
  console.log(JSON.stringify(drivetime))
});
