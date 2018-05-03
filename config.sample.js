var config = {};

// Server Settings
config.server = {};
config.server.port = 61002; // https://wiki.uberspace.de/system:ports

// PostGres DB
config.db = {};
config.db.name = 'YOUR_DB_NAME';
config.db.host = 'YOUR_DB_HOST'; // localhost
config.db.port = 'YOUR_DB_PORT'; // 5432

// Datasets stored in PostGRE SQL Database
config.db.tables = {};
config.db.tables.fos = 'colombia_fos_roi_h1_m0';
// config.db.tables.fos = 'colombia_fos_roi_h1_m0_clusters_fos1_thres';
config.db.tables.specialareas = 'ndvi_gradient_vector';

// HERE App Settings
config.here = {};
config.here.isoline_base = 'https://isoline.route.cit.api.here.com/routing/7.2/calculateisoline.json';
config.here.route_base = 'https://route.cit.api.here.com/routing/7.2/calculateroute.json';
config.here.app_id = 'YOUR_APP_ID';
config.here.app_code = 'YOUR_APP_CODE';

// Cache Settings
config.cache = {};
config.cache.dir = 'cache';
config.cache.duration = 1000*60*60*24*365*20;  // 20 Years (should be enough, right?)
// config.cache.duration = 1000*60*60*24;  // 1 Day

// Tolerance for Simplification
config.simplify = {};
config.simplify.tolerance = {};
config.simplify.tolerance.route = 0.0005;
config.simplify.tolerance.isoline = 0.001;

// Slicing params
config.profile = {};
config.profile.resolution = 10; // in meters

module.exports = config;
