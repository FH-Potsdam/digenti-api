var config = require('./../../config');
var utils = require('./../../utils/index');
var fs = require('fs');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var turf = require('turf');

// Example route from valledupar
var route = {"type":"Feature","properties":{"routeId":"AIQACAAAAB4AAABCAAAAlwAAAKEAAAB42mNYyMDAxMQABJPtXnrz+he5M0DBL6FykTsCATYM//9DBD7sZ0ACXEB8fMm1N0wMP5Yo+EzckQrXyCZcJsLIgFdj8k7tGkagxXBBwUzlDYuBNGOKmVKDBlMCAwMLkLfqlxzTijAGAGpUHtxVzwqR","distance":42278,"travelTime":4735,"waypoints":[{"originalPosition":[-73.2500001,10.4716669],"mappedPosition":[-73.2499002,10.4717332],"distance":13},{"originalPosition":[-72.9456789,10.4025199],"mappedPosition":[-72.976191,10.3887963],"distance":3670}]},"geometry":{"type":"LineString","coordinates":[[-73.2499002,10.4717332,172],[-73.2491755,10.4706573,170],[-73.2486176,10.4698634,168],[-73.2480276,10.4689515,167],[-73.2471263,10.4676533,166],[-73.2465792,10.466795,164],[-73.2463968,10.4666662,164],[-73.2463217,10.4665697,164],[-73.2461178,10.4662263,164],[-73.2449698,10.4666662,163],[-73.2437682,10.4672027,162],[-73.2435536,10.4668379,161],[-73.2434249,10.4666555,161],[-73.2434034,10.4653251,161],[-73.2434249,10.4644668,160],[-73.2435215,10.4643917,160],[-73.2435536,10.4642737,160],[-73.2435215,10.4641449,160],[-73.2434249,10.4640698,160],[-73.2433712,10.4639518,160],[-73.2433069,10.463115,160],[-73.2431567,10.4595745,156],[-73.2430065,10.4569674,154],[-73.2428133,10.4525578,151],[-73.2425237,10.4465389,146],[-73.2425451,10.4463887,146],[-73.2426953,10.446378,146],[-73.2428455,10.4463243,147],[-73.2429636,10.4462385,147],[-73.2430494,10.4461098,147],[-73.243103,10.4458952,147],[-73.2430708,10.4457343,147],[-73.2429314,10.4455626,146],[-73.242867,10.4455304,146],[-73.24247,10.4450905,147],[-73.2424271,10.4449725,147],[-73.2424164,10.4448116,147],[-73.2421696,10.4394901,143],[-73.2420731,10.4366362,143],[-73.2418799,10.4331493,139],[-73.2417834,10.4309928,138],[-73.2417083,10.4296625,135],[-73.2416654,10.4291368,133],[-73.2416439,10.4290724,133],[-73.2415795,10.4278278,133],[-73.2409251,10.4138052,127],[-73.2408285,10.4123032,126],[-73.2407641,10.4104471,124],[-73.240217,10.3995252,120],[-73.2397449,10.3895152,118],[-73.2394445,10.3838074,114],[-73.2394123,10.3834748,114],[-73.239305,10.3828955,115],[-73.2391655,10.3824127,115],[-73.2390046,10.3819835,116],[-73.2388008,10.3816295,116],[-73.2386506,10.3814256,116],[-73.2382214,10.380975,116],[-73.2379746,10.3807819,116],[-73.2377064,10.3806102,116],[-73.2374382,10.3804708,116],[-73.2371807,10.3803635,116],[-73.2368803,10.3802669,116],[-73.2362688,10.3801596,115],[-73.2359362,10.3801596,115],[-73.2356036,10.3801918,115],[-73.2351851,10.3802669,115],[-73.2348633,10.3803849,115],[-73.2345092,10.3805459,115],[-73.2341766,10.3807497,115],[-73.233887,10.380975,115],[-73.2335758,10.3812969,115],[-73.2333934,10.3815544,115],[-73.233254,10.3817904,115],[-73.2331467,10.3820264,114],[-73.2330608,10.3822947,114],[-73.2326317,10.3840864,113],[-73.2324171,10.3849125,115],[-73.2323313,10.3851378,115],[-73.2321703,10.3853953,114],[-73.2320094,10.3855562,114],[-73.2318699,10.3856635,114],[-73.2317734,10.3857172,114],[-73.2315266,10.385803,114],[-73.2312691,10.385803,114],[-73.2255399,10.3846872,116],[-73.2247138,10.3846121,116],[-73.2242095,10.3846121,116],[-73.2040071,10.3853846,127],[-73.201797,10.3854489,129],[-73.1949735,10.3856957,131],[-73.1817663,10.3862107,142],[-73.1808543,10.3862536,142],[-73.1798029,10.3862751,144],[-73.1783652,10.3863502,147],[-73.1777859,10.3863502,147],[-73.1777322,10.386318,147],[-73.1772923,10.3863394,148],[-73.1767988,10.3863394,148],[-73.1716704,10.386554,156],[-73.1711662,10.3866935,157],[-73.1707907,10.3868759,158],[-73.1705868,10.3869939,158],[-73.1703722,10.3871655,158],[-73.1698036,10.3878951,159],[-73.1693959,10.3883564,159],[-73.1687951,10.3878736,161],[-73.1678939,10.3875732,162],[-73.1671643,10.3874016,163],[-73.1654906,10.386951,166],[-73.163259,10.3865433,182],[-73.162508,10.3861785,180],[-73.1606627,10.3864574,188],[-73.1600189,10.3866506,188],[-73.1589031,10.3877664,187],[-73.1577229,10.389204,186],[-73.1571221,10.3893757,186],[-73.1554699,10.3896761,189],[-73.1535816,10.3891182,193],[-73.1524873,10.3888607,195],[-73.1509852,10.3891397,198],[-73.1484103,10.3884315,204],[-73.147788,10.3883457,205],[-73.1467152,10.3886461,207],[-73.1442904,10.3893971,212],[-73.1426597,10.3898692,215],[-73.1406426,10.3903842,219],[-73.1377459,10.3909421,225],[-73.1324029,10.3932595,242],[-73.1314158,10.3936243,245],[-73.1296349,10.3939891,251],[-73.1280255,10.3944182,256],[-73.1274462,10.3945899,258],[-73.1269956,10.3948689,260],[-73.1263518,10.3950834,262],[-73.1259656,10.3949976,263],[-73.1232834,10.3935385,273],[-73.1216311,10.3927016,279],[-73.120923,10.3925085,281],[-73.1200647,10.3925085,284],[-73.1193781,10.3927016,286],[-73.1186485,10.3928304,289],[-73.1157732,10.3917789,298],[-73.1151509,10.3918004,300],[-73.1148505,10.3919506,301],[-73.1133485,10.3935814,308],[-73.1128335,10.3940749,311],[-73.1120396,10.3944826,314],[-73.1074691,10.3960812,329],[-73.1061602,10.3965425,336],[-73.1057525,10.3965855,337],[-73.100431,10.396328,350],[-73.0996799,10.396328,353],[-73.0988431,10.3957272,356],[-73.0963755,10.3936672,365],[-73.094337,10.3908992,381],[-73.0938864,10.3907275,383],[-73.0929208,10.3905344,388],[-73.0919981,10.3905344,393],[-73.0914831,10.3908134,396],[-73.0906463,10.3914356,401],[-73.089509,10.3919291,407],[-73.088758,10.3920579,411],[-73.0880284,10.3918433,415],[-73.0876637,10.3918862,417],[-73.0864835,10.3923368,423],[-73.0846918,10.3930664,433],[-73.0821919,10.3940535,446],[-73.0815482,10.3942251,449],[-73.0791664,10.3942895,461],[-73.077836,10.3940535,468],[-73.0772352,10.3937531,472],[-73.076334,10.3933668,477],[-73.0756688,10.3933024,480],[-73.0744457,10.3934741,486],[-73.0737376,10.3933668,490],[-73.0703259,10.3910708,510],[-73.0693388,10.3906202,516],[-73.0668926,10.389719,529],[-73.0647469,10.388968,540],[-73.0631804,10.3883886,549],[-73.0618715,10.3881526,555],[-73.0609488,10.3878522,560],[-73.0605197,10.3877878,562],[-73.0598545,10.3878522,566],[-73.0591035,10.3881097,570],[-73.0580091,10.3885388,576],[-73.0579448,10.3885388,576],[-73.0574942,10.3885603,578],[-73.0562282,10.3881097,586],[-73.0557775,10.3877878,589],[-73.0552197,10.3875732,592],[-73.0545974,10.3878307,596],[-73.0539322,10.3880668,600],[-73.0533743,10.3880882,603],[-73.0523229,10.3880024,609],[-73.0518079,10.3877664,612],[-73.0515289,10.3878093,614],[-73.0510998,10.3882813,617],[-73.0503702,10.3885388,622],[-73.0498767,10.3884315,624],[-73.0493617,10.3884101,627],[-73.0491471,10.3886032,629],[-73.0487394,10.3895044,634],[-73.0483747,10.3898692,637],[-73.0478811,10.3905344,642],[-73.0475378,10.3909421,645],[-73.0465508,10.3911781,651],[-73.0455637,10.3908348,656],[-73.0448127,10.3906846,661],[-73.0438471,10.390749,666],[-73.0430317,10.390749,671],[-73.0421948,10.3906417,675],[-73.0414224,10.3905773,680],[-73.0408001,10.390749,683],[-73.0383754,10.3922081,699],[-73.037796,10.3922403,699],[-73.0375385,10.3922081,699],[-73.037045,10.3921759,702],[-73.0315411,10.3919291,729],[-73.0308974,10.3918755,735],[-73.029213,10.3923798,754],[-73.0286872,10.3926158,759],[-73.0279469,10.3929806,764],[-73.0273354,10.3932273,766],[-73.0264449,10.3934956,770],[-73.0237627,10.3940964,787],[-73.0236554,10.3937852,789],[-73.0234087,10.3931952,788],[-73.0224967,10.3937638,795],[-73.0217779,10.3941822,802],[-73.0213916,10.3943431,806],[-73.0205655,10.394547,815],[-73.0198359,10.3946757,820],[-73.0174756,10.3943753,838],[-73.0169821,10.3945041,842],[-73.0167246,10.3947616,845],[-73.0164886,10.3951049,848],[-73.0163813,10.395062,849],[-73.0161667,10.3948259,852],[-73.0160165,10.3948903,853],[-73.0157804,10.395062,855],[-73.0153298,10.3952122,859],[-73.0152225,10.3953838,861],[-73.0149651,10.3955126,863],[-73.0149221,10.3953195,864],[-73.0150294,10.395062,867],[-73.0149865,10.3949547,868],[-73.0145144,10.3949547,871],[-73.013463,10.3948259,880],[-73.0129266,10.3946972,884],[-73.0127978,10.3945255,886],[-73.0124116,10.394311,889],[-73.0121326,10.3942251,892],[-73.0115962,10.3941822,896],[-73.0115104,10.3940105,897],[-73.0115962,10.3939033,898],[-73.0116177,10.3937745,899],[-73.0113816,10.3935814,902],[-73.0113816,10.3934312,903],[-73.0113173,10.3933239,904],[-73.0109739,10.3931522,907],[-73.0106091,10.3930449,910],[-73.0103302,10.3928733,913],[-73.0100942,10.3927875,915],[-73.0097723,10.392766,917],[-73.0094504,10.3927875,920],[-73.0090857,10.3926587,923],[-73.0088711,10.3927016,925],[-73.0085921,10.3925943,927],[-73.008399,10.3923154,930],[-73.008163,10.3921223,932],[-73.0079913,10.3921437,934],[-73.0079055,10.3920794,934],[-73.0079055,10.3917575,937],[-73.0075836,10.3913498,941],[-73.0072618,10.3913927,944],[-73.0070257,10.3912854,946],[-73.0068755,10.3911567,947],[-73.0064893,10.3906846,952],[-73.0063391,10.3905773,953],[-73.006146,10.3905344,955],[-73.0058455,10.3903413,958],[-73.0055881,10.3901482,960],[-73.0052876,10.3898263,964],[-73.0048156,10.389719,968],[-73.004601,10.3896117,970],[-73.0041504,10.3895688,973],[-73.0033994,10.3896976,979],[-73.0030131,10.3896546,982],[-73.0027771,10.3895688,984],[-73.0025625,10.3893113,987],[-73.0023479,10.3890967,989],[-73.002069,10.3888822,992],[-73.0017471,10.3885174,996],[-73.0012965,10.3881526,1001],[-73.0009103,10.3879595,1004],[-73.0006957,10.387938,1006],[-73.0003953,10.3880668,1008],[-73.0002236,10.387938,1010],[-72.9999661,10.3876591,1013],[-72.9996443,10.3875303,1016],[-72.9989576,10.3874016,1021],[-72.9986572,10.387466,1024],[-72.9982924,10.3873372,1027],[-72.9981208,10.3871226,1029],[-72.9979491,10.3870153,1031],[-72.9974127,10.3871655,1035],[-72.9971981,10.3871441,1037],[-72.9969192,10.3869939,1039],[-72.9968119,10.3868437,1041],[-72.9964256,10.3866506,1044],[-72.9960823,10.3865647,1047],[-72.9958677,10.3866291,1049],[-72.9953313,10.3865004,1053],[-72.9950523,10.3865004,1055],[-72.994709,10.3863072,1059],[-72.9944944,10.3862214,1060],[-72.9941511,10.3862858,1063],[-72.9935503,10.3858995,1069],[-72.9933572,10.3858781,1070],[-72.9926705,10.3861356,1076],[-72.9923058,10.3862,1079],[-72.9920053,10.3861356,1082],[-72.9917049,10.3860283,1084],[-72.9915762,10.3860712,1085],[-72.9912329,10.3862429,1088],[-72.9909539,10.3862,1091],[-72.9907608,10.3862,1092],[-72.9904389,10.3859425,1095],[-72.9900742,10.3857923,1098],[-72.9898596,10.3855562,1101],[-72.9895806,10.3854489,1103],[-72.9892802,10.3853631,1106],[-72.9889798,10.3852987,1108],[-72.9886794,10.3853416,1111],[-72.9881215,10.3855991,1115],[-72.9879498,10.3856635,1117],[-72.9877353,10.3858781,1119],[-72.9872847,10.3859425,1123],[-72.9869843,10.3861141,1126],[-72.9866409,10.3862429,1129],[-72.986362,10.3861785,1131],[-72.986083,10.3862429,1133],[-72.9853106,10.3865218,1140],[-72.9851604,10.3866076,1141],[-72.9849887,10.3867364,1143],[-72.9847956,10.3867149,1144],[-72.9846883,10.3866506,1145],[-72.9844522,10.3867149,1147],[-72.9841518,10.3870368,1151],[-72.9834008,10.3871441,1157],[-72.9831648,10.3872085,1159],[-72.9830575,10.3873801,1160],[-72.9829931,10.3875732,1162],[-72.9827571,10.3877449,1164],[-72.9823923,10.3878307,1167],[-72.9821134,10.3881097,1170],[-72.9818344,10.3882384,1173],[-72.9813838,10.3882384,1176],[-72.9810834,10.3883457,1179],[-72.9806328,10.3885603,1183],[-72.9803324,10.3885174,1185],[-72.9800534,10.3883672,1188],[-72.9798388,10.3884101,1189],[-72.9794955,10.3886247,1193],[-72.9791522,10.3886247,1195],[-72.9785943,10.3883243,1200],[-72.9782724,10.3883243,1203],[-72.9775858,10.3884315,1208],[-72.9768562,10.3884745,1214],[-72.9764915,10.3886247,1217],[-72.976191,10.3887963,1220]]}};

// Chunks config
var chunkLength = 0.01;
var chunkUnit = 'kilometers';

// Use geoprocessing's sliceLine3D function
utils.geo.sliceRoute(route, chunkLength, chunkUnit)
    .then (function (slicedPolys) {
        console.log("File saved!");
        var fc = turf.featureCollection(slicedPolys);
        fs.writeFileSync('../road_sliced_3d_here.json', JSON.stringify(fc));
    })
    .catch(function (err) { console.log('Something went wrong: ' + err); });
