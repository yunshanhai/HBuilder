function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    set: function (x, y) {
        this.x = x;
        this.y = y;
    },
    setLength: function (len) {
        var d = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x = this.x / d * len;
        this.y = this.y / d * len;
    },
    distance: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}