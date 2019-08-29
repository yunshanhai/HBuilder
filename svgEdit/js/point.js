function Point(x, y) {
    this.x = x;
    this.y = y;
    this.color = "#ff00ff";
    this.isEdit = false;

    this.settings = [
        { value: this.x, property: "x", content: "横坐标" },
        { value: this.y, property: "y", content: "纵坐标" }
    ];
}
Point.prototype = {
    draw: function (ctx, r, ratio) {
        if (this.isEdit) {
            ctx.fillStyle = this.color;
        }
        else {
            ctx.fillStyle = "black";
        }
        
        ctx.beginPath();
        ctx.arc(this.x * ratio, this.y * ratio, r, 0, Math.PI * 2, false);
        ctx.fill();
    },
    set: function (x, y) {
        this.x = x;
        this.y = y;
    },
    capture: function (x, y, r, ratio) {
        var deltaX = x - this.x, deltaY = y - this.y;
        var sLen = deltaX * deltaX + deltaY * deltaY;

        if (sLen * ratio * ratio < r * r) {
            this.isEdit = true;
            return true;
        }
        return false;
    },
    setNearPointByVector: function (v, x, y) {
        var newV = { x: x - this.x, y: y - this.y };
        var dot = v.x * newV.x + v.y * newV.y;
        this.x += dot * v.x;
        this.y += dot * v.y;
    },
    distance: function (p) {
        var dx = this.x - p.x, dy = this.y - p.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    getSetting: function () {
        var settings = this.settings;
        for (var i = 0; i < settings.length; i++) {
            settings[i].value = this[settings[i].property];
        }
        return settings;
    }
}
