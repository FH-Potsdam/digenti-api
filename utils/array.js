////////////////////////
// Override / Extends
////////////////////////

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


/////////////////
// Array Utils
/////////////////

var array = {};

// Array Unique
array.arrayUnique = function(arr) {

    var uniqueArray = [];

    for (var i=0; i<arr.length; i++) {

        var duplicate = false;

        for (var j=0; j<uniqueArray.length; j++) {

            //console.log("arr: " + arr[i].length + "     –     uniqueArray: " + uniqueArray[j]["coords"].length);

            if (arr[i].length === uniqueArray[j]["coords"].length) {

                for (var k=0; k<arr[i].length; k++) {
                    if ((arr[i][k][0] === uniqueArray[j]["coords"][k][0]) && (arr[i][k][1] === uniqueArray[j]["coords"][k][1]) && (arr[i][k][2] === uniqueArray[j]["coords"][k][2])) {
                        duplicate = true;
                    }
                }

                if (duplicate) { uniqueArray[j]["counter"] = uniqueArray[j]["counter"] + 1 ; }
            }
        }

        console.log(i);
        if (!duplicate) {
            var a = [];
            a["coords"] = arr[i];
            a["counter"] = 1;
            uniqueArray.push(a);
        }
        console.log(i);

    }

    return uniqueArray;
}

module.exports = array;
