var cache = {};
var fs = require('fs');
var util = require('util');
var config = require('./../config');
var fileExists = require('file-exists');
var jsonfile = require('jsonfile');

// Check if cache-dir (defined in config.cache.dir) exists > if no: create it
cache.checkAndCreateCacheDir = function () {
    if (!fs.existsSync(config.cache.dir)) { fs.mkdirSync(config.cache.dir); }
}

// check if subdir in cache dir exists. if not: create it. returns path of subdir
cache.checkAndCreateCacheSubDir = function (sub) {
    var sub_dir = config.cache.dir + '/' + sub;
    if (!fs.existsSync(sub_dir)) { fs.mkdirSync(sub_dir); }
    return sub_dir;
}


// check if a single cache file exists and is still valid – return status (true/false)
cache.checkCacheValidity = function (file) {

    // cache use is default
    var useCache = true;

    // check if there is fitting a file in cache
    if (fileExists(file)) {
        var stats = fs.statSync(file);
        var mtime = new Date(util.inspect(stats.mtime));    // last modified date timestamp of file
        var currentDate = new Date().getTime();
        diff = currentDate - mtime.getTime();
        if (diff > config.cache.duration) { useCache = false; } // file is outdated > do not use cache
    } else { useCache = false; } // there is no file > do not use cache

    return useCache;
}

// get file from cache (by subdir and filename)
cache.getCacheFile = function (subdir, filename) {
    this.checkAndCreateCacheDir();
    var file = this.checkAndCreateCacheSubDir(subdir) + '/' + filename;
    return file;
}

// write data in cache file
cache.writeCacheFile = function (file, data) {
    jsonfile.writeFile(file, data, function (err) {
        console.error(err)
    });
}

// read data from cache file
cache.readCacheFile = function (file) {
    return jsonfile.readFileSync(file);
}


module.exports = cache;
