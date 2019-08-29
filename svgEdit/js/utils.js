var utils = {
    changeColor: function (str, alpha) {
        alpha = alpha || 1;
        if (str.indexOf("#") > -1) {
            var num = parseInt(str.slice(-6), 16);
            var r = parseInt(num / 65536);
            var g = parseInt((num % 65536) / 256);
            var b = num % 256;
            var a = alpha;
            return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")"; 
        }
    },
    getAngle: function (p1, p2) {
        var theta =  Math.atan2(p2.y - p1.y, p2.x - p1.x);
        if (theta < 0) {
            return 2 * Math.PI + theta;
        }
        else {
            return theta;
        }
    }
};