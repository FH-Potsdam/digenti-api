var config = require('./../config');
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + config.db.host + ':' + config.db.port + '/' + config.db.name;
var db = pgp(connectionString);


////////////////////
// API Functions
////////////////////

// api/places
function getAllPlaces(req, res, next) {
    db.any('select * from places_aoi_2d')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL places'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

// api/places/:id
function getPlace(req, res, next) {
    var placeID = parseInt(req.params.id);
    db.one('select * from places_aoi_2d where gid = $1', placeID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ONE place'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}


/////////////
// Exports
/////////////

module.exports = {
    getAllPlaces: getAllPlaces,
    getPlace: getPlace
};
