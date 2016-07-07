var turf = require('turf');

var pt = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Point",
    "coordinates": [-73.0288341011, 10.3907483154]
  }
};

var polygon = {
    "type": "Feature",
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [
                    [-73.036567, 10.459796],
                    [-73.035765, 10.458756],
                    [-73.035215, 10.458846],
                    [-73.035193, 10.458609],
                    [-73.035306, 10.458592],
                    [-73.035201, 10.458177],
                    [-73.035266, 10.457861],
                    [-73.034796, 10.458004],
                    [-73.034793, 10.45812],
                    [-73.034438, 10.458184],
                    [-73.034385, 10.457805],
                    [-73.034385, 10.457696],
                    [-73.034383, 10.457597],
                    [-73.034341, 10.457256],
                    [-73.033722, 10.457308],
                    [-73.033623, 10.456779],
                    [-73.034017, 10.456725],
                    [-73.033989, 10.456377],
                    [-73.033982, 10.456358],
                    [-73.033932, 10.456212],
                    [-73.033397, 10.45627],
                    [-73.033285, 10.455384],
                    [-73.033872, 10.455315],
                    [-73.033918, 10.45526],
                    [-73.033972, 10.455198],
                    [-73.033823, 10.453878],
                    [-73.034699, 10.453745],
                    [-73.034643, 10.453102],
                    [-73.035501, 10.452986],
                    [-73.035566, 10.453348],
                    [-73.03569, 10.453331],
                    [-73.035854, 10.453307],
                    [-73.037447, 10.45305],
                    [-73.037565, 10.453036],
                    [-73.037674, 10.453027],
                    [-73.037661, 10.452877],
                    [-73.038542, 10.452739],
                    [-73.038566, 10.452964],
                    [-73.038636, 10.452952],
                    [-73.038713, 10.452939],
                    [-73.038995, 10.452895],
                    [-73.039065, 10.453482],
                    [-73.039311, 10.453463],
                    [-73.039551, 10.45345],
                    [-73.040191, 10.453371],
                    [-73.040394, 10.454445],
                    [-73.040406, 10.454616],
                    [-73.040417, 10.454756],
                    [-73.040455, 10.454985],
                    [-73.040471, 10.455082],
                    [-73.040585, 10.456072],
                    [-73.040841, 10.456013],
                    [-73.04111, 10.455955],
                    [-73.04187, 10.455858],
                    [-73.041959, 10.456351],
                    [-73.041179, 10.456426],
                    [-73.040964, 10.456719],
                    [-73.040769, 10.456983],
                    [-73.040553, 10.457072],
                    [-73.040481, 10.457165],
                    [-73.040396, 10.45727],
                    [-73.040441, 10.457472],
                    [-73.040771, 10.457987],
                    [-73.041035, 10.458894],
                    [-73.040554, 10.459433],
                    [-73.040346, 10.45951],
                    [-73.040091, 10.459604],
                    [-73.039223, 10.45978],
                    [-73.039074, 10.459703],
                    [-73.038885, 10.459605],
                    [-73.036792, 10.460075],
                    [-73.036567, 10.459796]
                ]
            ]
        ]
    },
    "properties": {
        "cartodb_id": 4,
        "objectid": 2071,
        "nom_dane": "El Plan",
        "tipo": "C",
        "codane": "44420",
        "codanepob": "44420001",
        "nombre": "El Plan",
        "cpob_ccdgo": "001",
        "lon": -73.037477804,
        "lat": 10.4563161656,
        "shape_area": 0.00004142915,
        "shape_leng": 0.0320327242605
    }
};

var lineString = {
    "type": "Feature",
    "properties": {
        "OBJECTID_1": 4175,
        "ID_VIA": "",
        "DESCRIPCIO": "",
        "CLASIFICAC": 4,
        "CATEGORIA": "CAMINO",
        "Length": 0
    },
    "geometry": {
        "type": "MultiLineString",
        "coordinates": [
            [
                [-72.950110353012064, 10.492615699083442],
                [-72.952254354382546, 10.486566494699586],
                [-72.955313930053791, 10.480241678093066],
                [-72.96227991391136, 10.466870102692775],
                [-72.965347112602203, 10.460092289212907],
                [-72.967201203687182, 10.451294522604632],
                [-72.967384389107693, 10.444507136309538],
                [-72.968223725102959, 10.438643863606709],
                [-72.970726295947202, 10.434159672965848],
                [-72.972488774225951, 10.430586205167714],
                [-72.973144953158851, 10.429395074279784]
            ]
        ]
    }
};

var unit = 'kilometers';

var bufferedPoint = turf.buffer(pt, 0.2, unit);
var bufferedPolygon = turf.buffer(polygon, 0.2, unit);
var bufferedLineString = turf.buffer(lineString, 0.2, unit);

var result = turf.featureCollection([bufferedPoint, pt, bufferedPolygon, polygon, bufferedLineString, lineString]);

console.log(JSON.stringify(result));
