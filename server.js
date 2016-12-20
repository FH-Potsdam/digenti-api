//////////////////////
// REST API Server
//////////////////////

var config = require('./config')
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

// API
var api = require('./api/index');

// Server App
var app = express();


///////////////////////
// Server Middleware
///////////////////////

app.use(logger(app.get("env") === "production" ? "combined" : "dev"));

// parse application/json
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
// This allows client applications from other domains use the API Server
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    next();
});



//////////////////
// API Queries
//////////////////

app.use('/', api);


//////////////////
// Server Setup
//////////////////

app.set("env", process.env.NODE_ENV || "development");
app.set("host", process.env.HOST || "0.0.0.0");
app.set("port", process.env.PORT || config.server.port);

app.listen(app.get("port"), function () {
    console.log('\n' + '*****************************************');
    console.log('DIGENTI REST API listening on port ' + app.get("port"));
    console.log('*****************************************' + '\n');

    //console.log("-- FOS table: " + config.db.tables.fos);
    //console.log("-- Special Areas table: " + config.db.tables.specialareas);
    console.log("");
});


////////////////////
// Error Handlers
////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status( err.code || 500 )
        .json({
            status: 'error',
            message: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    .json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;
