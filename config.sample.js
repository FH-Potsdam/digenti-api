var config = {};

// Server Settings
config.server = {};
config.server.port = 61002; // https://wiki.uberspace.de/system:ports

// PostGres DB
config.db = {};
config.db.name = 'YOUR_DB_NAME';
config.db.host = 'YOUR_DB_HOST'; // localhost
config.db.port = 'YOUR_DB_PORT'; // 5432

// HERE App Settings
config.here = {};
config.here.isoline_base = 'https://isoline.route.cit.api.here.com/routing/7.2/calculateisoline.json';
config.here.route_base = 'https://route.cit.api.here.com/routing/7.2/calculateroute.json';
config.here.app_id = 'YOUR_APP_ID';
config.here.app_code = 'YOUR_APP_CODE';

// Cache Settings
config.cache = {};
config.cache.dir = 'cache';
config.cache.duration = 1000*60*60*24;  // 1 Day

// Tolerance for Simplification
config.simplify = {};
config.simplify.tolerance = {};
config.simplify.tolerance.route = 0.0005;
config.simplify.tolerance.isoline = 0.001;

module.exports = config;
