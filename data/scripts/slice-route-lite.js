var fs = require('fs');
var turf = require('turf');
turf.lineChunk = require('turf-line-chunk');

//=line
var fc = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "id": "roads_aoi_3d.fid--13aa481b_154c84d31a9_-2050",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-73.1193002, 10.392685, 272.75860595703125],
                [-73.1187244, 10.3927948, 275.0245361328125],
                [-73.1184567, 10.3927543, 274.64373779296875],
                [-73.1174436, 10.3923976, 281.02801513671875],
                [-73.1156536, 10.3917181, 297.23486328125],
                [-73.1152648, 10.3917321, 290.4064025878906],
                [-73.1150064, 10.3918484, 286.888916015625],
                [-73.1148181, 10.3919798, 289.99896240234375],
                [-73.1130882, 10.3938684, 296.9350280761719],
                [-73.1127933, 10.3941037, 300.8330993652344],
                [-73.1124642, 10.3942961, 298.2091369628906],
                [-73.1115344, 10.3946497, 301.8802795410156],
                [-73.1099948, 10.3951686, 308.5584716796875],
                [-73.1080007, 10.3958975, 317.6228942871094],
                [-73.1063426, 10.3964609, 319.71551513671875],
                [-73.1057754, 10.3965745, 323.060791015625],
                [-73.1051873, 10.396577, 322.87762451171875],
                [-73.1034086, 10.396505, 335.3573303222656],
                [-73.1012982, 10.3963474, 339.50885009765625],
                [-73.1001229, 10.3963258, 341.1419677734375],
                [-73.0996326, 10.3962838, 344.8725280761719],
                [-73.099266, 10.396065, 346.1246337890625],
                [-73.0989064, 10.3957945, 346.6461181640625],
                [-73.0978406, 10.3949253, 348.216552734375],
                [-73.096366, 10.3936636, 358.060546875],
                [-73.0957352, 10.3927261, 363.3768005371094],
                [-73.0952143, 10.3919819, 368.21484375],
                [-73.0945221, 10.3910198, 373.695556640625],
                [-73.0941837, 10.3908059, 371.7884826660156],
                [-73.0939245, 10.3907097, 372.66943359375],
                [-73.093402, 10.3906046, 382.88189697265625],
                [-73.0926095, 10.3905041, 381.24169921875],
                [-73.0922547, 10.39052, 380.6203308105469],
                [-73.0918945, 10.3905797, 382.864013671875],
                [-73.0902082, 10.391622, 388.3809509277344],
                [-73.0895366, 10.391894, 395.91802978515625],
                [-73.0890621, 10.3920365, 398.260009765625],
                [-73.0885896, 10.3920207, 400.5214538574219],
                [-73.0880806, 10.3918595, 407.693603515625],
                [-73.0878225, 10.3918484, 411.5733947753906],
                [-73.0875435, 10.3919029, 406.2220764160156],
                [-73.0867331, 10.3922305, 410.6136169433594],
                [-73.0849304, 10.3929676, 422.8828430175781],
                [-73.0829826, 10.3937382, 430.463134765625],
                [-73.0819581, 10.3941431, 437.5068664550781],
                [-73.0813363, 10.3942292, 438.0920715332031],
                [-73.0803731, 10.3942215, 444.9460144042969],
                [-73.0790519, 10.3942599, 452.1756286621094],
                [-73.0779843, 10.3940754, 459.9459533691406],
                [-73.0762993, 10.3933495, 464.9245300292969],
                [-73.0756481, 10.393307, 468.53778076171875],
                [-73.0748566, 10.3934293, 476.08770751953125],
                [-73.0742048, 10.3934469, 471.05950927734375],
                [-73.0737324, 10.393348, 472.0519714355469],
                [-73.0733865, 10.393213, 475.1094055175781],
                [-73.0730442, 10.3929218, 473.6600646972656],
                [-73.0711383, 10.3916249, 484.8857727050781],
                [-73.0699212, 10.3908501, 490.02618408203125],
                [-73.0673284, 10.3898829, 505.29827880859375],
                [-73.0644604, 10.388845, 519.3497314453125],
                [-73.0631847, 10.3884261, 530.408935546875],
                [-73.0620145, 10.3881484, 524.1179809570312],
                [-73.0605768, 10.3877433, 527.47607421875],
                [-73.0600158, 10.3878033, 529.6289672851562],
                [-73.0579562, 10.3884983, 540.005615234375],
                [-73.0575886, 10.3885433, 548.9818725585938],
                [-73.0570801, 10.3884102, 545.1841430664062],
                [-73.0562022, 10.3880667, 552.5023803710938],
                [-73.0554388, 10.3876172, 556.8712158203125],
                [-73.0550943, 10.3876379, 564.5042724609375],
                [-73.0547884, 10.3877464, 567.3211059570312],
                [-73.0541388, 10.3880026, 568.461181640625],
                [-73.0533976, 10.3880671, 575.7611083984375],
                [-73.0525879, 10.3880233, 573.4673461914062],
                [-73.0521353, 10.387915, 582.5369873046875],
                [-73.0518352, 10.3877866, 583.8855590820312],
                [-73.0516451, 10.3877788, 583.8239135742188],
                [-73.0514761, 10.387913, 590.3718872070312],
                [-73.0510242, 10.3882674, 591.0938720703125],
                [-73.0503833, 10.388503, 593.5767211914062],
                [-73.049819, 10.388417, 598.1057739257812],
                [-73.0493742, 10.3884307, 598.222412109375],
                [-73.0491788, 10.3885597, 604.4012451171875],
                [-73.0490171, 10.3887384, 609.431640625],
                [-73.0487681, 10.3893948, 624.14990234375],
                [-73.0485885, 10.3896553, 626.5208129882812],
                [-73.0479893, 10.3904264, 636.1298828125],
                [-73.0476037, 10.3908612, 629.505859375],
                [-73.0473571, 10.3909847, 626.912841796875],
                [-73.0470429, 10.3910895, 636.7523803710938],
                [-73.0466948, 10.3911451, 638.1148071289062],
                [-73.0463112, 10.3910718, 639.6050415039062],
                [-73.0457928, 10.3908306, 642.0217895507812],
                [-73.0453893, 10.390713, 649.6583251953125],
                [-73.0447761, 10.3906679, 652.631591796875],
                [-73.0432778, 10.3907201, 659.2074584960938],
                [-73.0425232, 10.3906679, 664.7406005859375],
                [-73.0418612, 10.3906028, 669.7259521484375],
                [-73.0414472, 10.3905868, 677.1231689453125],
                [-73.0409645, 10.3907115, 676.1318359375],
                [-73.0406126, 10.3908474, 680.49609375],
                [-73.0402084, 10.3910341, 680.2135620117188],
                [-73.0395367, 10.3914569, 685.6773681640625],
                [-73.0386463, 10.3920791, 691.8216552734375],
                [-73.0383488, 10.392202, 692.041259765625],
                [-73.0380262, 10.3922123, 694.2180786132812],
                [-73.0376905, 10.3922149, 696.4523315429688],
                [-73.0354941, 10.3920845, 710.5657348632812],
                [-73.0335358, 10.3920077, 720.0418701171875],
                [-73.0326815, 10.3919741, 729.38232421875],
                [-73.031936, 10.3919449, 732.61328125],
                [-73.0310134, 10.3918976, 736.6646728515625],
                [-73.0308374, 10.3917963, 738.1138305664062],
                [-73.0307283, 10.3916717, 738.9810791015625],
                [-73.0304406, 10.391049, 741.1295166015625],
                [-73.0299985, 10.3900918, 741.1845703125],
                [-73.0295921, 10.3892121, 739.9046020507812],
                [-73.0295435, 10.3891113, 740.5916748046875],
                [-73.0293026, 10.3886114, 740.661865234375]
            ]
        },
        "geometry_name": "geom",
        "properties": {
            "gid": 157,
            "osm_id": "336609942",
            "name": null,
            "ref": null,
            "type": "tertiary",
            "oneway": 0,
            "bridge": 0,
            "tunnel": 0,
            "maxspeed": null
        }
    }]
};

var line = fc.features[0];


var distance = turf.lineDistance(line, 'kilometers');

console.log("distance: " + distance);

var result = turf.lineChunk(line, 0.01, 'kilometers');

var lastElev = 0;
result.features.forEach(function(ft, ind) {
    ft.properties.stroke = (ind % 2 === 0) ? 'a' : 'b';
    ft.properties.elev = getElevation(ft);
    console.log("elev: " + ft.properties.elev);
});

function getElevation(ft) {

    var coords = ft.geometry.coordinates;

    for (var i=0; i<coords.length; i++) {
        if (coords[i].length > 2) {
            lastElev = coords[i][2];
            break;
        }
    }

    return lastElev;
}

//=result
// console.log(JSON.stringify(result));

fs.writeFileSync('../data/road_3d_sliced.json', JSON.stringify(result));



// var turf = require('turf');
// turf.lineChunk = require('turf-line-chunk');
//
// var line = {
//   "type": "Feature",
//   "properties": {},
//   "geometry": {
//     "type": "LineString",
//     "coordinates": [
//       [
//         -86.28524780273438,
//         40.250184183819854
//       ],
//       [
//         -85.98587036132812,
//         40.17887331434696
//       ],
//       [
//         -85.97213745117188,
//         40.08857859823707
//       ],
//       [
//         -85.77987670898438,
//         40.15578608609647
//       ]
//     ]
//   }
// };
//
// //=line
//
// var distance = turf.lineDistance(line, 'kilometers');
//
// console.log("distance: " + distance);
//
// var result = turf.lineChunk(line, 15, 'miles');
//
// result.features.forEach(function(ft, ind) {
//   ft.properties.stroke = (ind % 2 === 0) ? '#f40' : '#389979';
// });
//
// //=result
// console.log(JSON.stringify(result));
