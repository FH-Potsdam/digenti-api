// REST API Server

var config = require('./config')
  , fs = require('fs')
  , express = require('express')
  // , bodyParser = require('body-parser')

var app = express();


///////////////////////
// Server Middleware
///////////////////////

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
// app.use(bodyParser.json());

// CORS
// This allows client applications from other domains use the API Server
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//////////////
// REST API
//////////////

require('./routing/api').init(app);


//////////////////
// Server Setup
//////////////////

// Create Express.js HTTP Server
var server = app.listen(process.argv[2] || config.server.port, function () {
  console.log('DIGENTI REST API listening on port ' + server.address().port + '\n');
});
