var turf = require('turf');

var array = ["52.517395,13.3773136", "52.5172234,13.3777428", "52.5167084,13.3779144", "52.5146484,13.3779144", "52.5141335,13.3777428", "52.5139618,13.3772278", "52.5141335,13.3767128", "52.5146484,13.3765411", "52.5167084,13.3765411", "52.5172234,13.376627", "52.517395,13.3768845", "52.517395,13.3773136"];

var coordsArray = array.map(function(str) {
    return str.split(",").map(Number).reverse(); // Reverse for GeoJSON
});

var polygon = turf.polygon([coordsArray]);

console.log(JSON.stringify(polygon));
