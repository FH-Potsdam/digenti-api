var turf = require('turf');
var unit = 'meters';

var polygon = {"type":"Feature","properties":{"objectID":"id1467893753242cprs90re417cegat"},"geometry":{"type":"Polygon","coordinates":[[[-73.2615433,10.35291],[-73.2390213,10.3819904],[-73.2390213,10.3819904],[-73.2395172,10.3849201],[-73.2395172,10.3849201],[-73.239769,10.3894901],[-73.239769,10.3894901],[-73.2411499,10.41819],[-73.2411499,10.41819],[-73.2412109,10.4193697],[-73.2412109,10.4193697],[-73.2390976,10.4198198],[-73.2390976,10.4198198],[-73.2318268,10.3857298],[-73.2318268,10.3857298],[-73.1837234,10.3861504],[-73.1837234,10.3861504],[-73.1793518,10.3996096],[-73.1793518,10.3996096],[-73.1704483,10.4000998],[-73.1704483,10.4000998],[-73.1626434,10.4005299],[-73.1626434,10.4005299],[-73.1477585,10.4321499],[-73.1477585,10.4321499],[-73.1441193,10.4395704],[-73.1441193,10.4395704],[-73.1651688,10.4582996],[-73.1651688,10.4582996],[-73.1671982,10.4627104],[-73.1671982,10.4627104],[-73.1656799,10.4867496],[-73.1656799,10.4867496],[-73.1664276,10.4915104],[-73.1664276,10.4915104],[-73.1381378,10.4506903],[-73.1381378,10.4506903],[-73.1441727,10.4394398],[-73.1441727,10.4394398],[-73.148201,10.4035397],[-73.148201,10.4035397],[-73.1018906,10.3964005],[-73.1018906,10.3964005],[-73.0958176,10.39291],[-73.0958176,10.39291],[-73.0579529,10.3885403],[-73.0579529,10.3885403],[-73.0372772,10.3950596],[-73.0372772,10.3950596],[-73.0268784,10.4119501],[-73.0268784,10.4119501],[-73.0261993,10.42729],[-73.0261993,10.42729],[-73.0400925,10.4562998],[-73.0400925,10.4562998],[-73.0269165,10.42976],[-73.0269165,10.42976],[-73.0261917,10.4312897],[-73.0261917,10.4312897],[-73.0128403,10.4382601],[-73.0128403,10.4382601],[-73.0008926,10.4312],[-73.0008926,10.4312],[-73.0258026,10.4203501],[-73.0258026,10.4203501],[-73.026062,10.4105997],[-73.026062,10.4105997],[-73.0174789,10.3943796],[-73.0174789,10.3943796],[-72.9761887,10.3887997],[-72.9761887,10.3887997],[-72.9880829,10.3696804],[-72.9880829,10.3696804],[-73.0147324,10.3825197],[-73.0147324,10.3825197],[-73.0275574,10.3746595],[-73.0275574,10.3746595],[-73.0371704,10.3479404],[-73.0371704,10.3479404],[-73.0228119,10.3435898],[-73.0228119,10.3435898],[-73.0494537,10.3458405],[-73.0494537,10.3458405],[-73.0643463,10.3466902],[-73.0643463,10.3466902],[-73.072319,10.3688803],[-73.072319,10.3688803],[-73.1364212,10.3915195],[-73.1364212,10.3915195],[-73.1606598,10.3864603],[-73.1606598,10.3864603],[-73.16465,10.38414],[-73.16465,10.38414],[-73.1744232,10.3787098],[-73.1744232,10.3787098],[-73.1794205,10.3762398],[-73.1794205,10.3762398],[-73.1790085,10.3478699],[-73.1790085,10.3478699],[-73.1737518,10.3353701],[-73.1737518,10.3353701],[-73.1528473,10.3236704],[-73.1528473,10.3236704],[-73.1725388,10.3091497],[-73.1725388,10.3091497],[-73.1862564,10.32693],[-73.1862564,10.32693],[-73.2060165,10.2919598],[-73.2060165,10.2919598],[-73.2186203,10.31217],[-73.2186203,10.31217],[-73.2012024,10.3247204],[-73.2012024,10.3247204],[-73.2063217,10.3457699],[-73.2063217,10.3457699],[-73.2310715,10.3558598],[-73.2310715,10.3558598],[-73.2615433,10.35291]]]}};

var bufferedPolygon = turf.buffer(polygon, 500, unit);

var result = turf.featureCollection([bufferedPolygon, polygon]);

console.log(JSON.stringify(result));
