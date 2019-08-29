function PolyProto() {
    SvgProto.call(this);
}

PolyProto.prototype = new SvgProto();

PolyProto.prototype.receiveMovePoint = function (x, y, obj) {
    if (this.currentStep === 1) {
        this.isMove = true;
        return false;
    }
    else {
        var points = this.points;
        for (var i = 0; i < points.length; i++) {
            if (points[i].isEdit) {
                points[i].set(x, y);
                return true;
            }
        }
        this.isMove = true;
        return false;
    }
};
PolyProto.prototype._createPointStr = function () {
    var as = [];
    for (var i = 0; i < this.points.length; i++) {
        as.push(this.points[i].x + " " + this.points[i].y);
    }
    return as.join(", ");
}
PolyProto.prototype.receiveDownPoint = function (x, y, svg) {
    var isChange = false;
    var points = this.points;
    for (var i = 0; i < points.length; i++) {
        if (points[i].isEdit) {
            points[i].isEdit = false;
            isChange = true;
            break;
        }
    }
    var ratio = (svg.isLineScale ? svg.ratio: 1);
    if (this.currentStep === 1) {
        this.downPosition.x = x;
        this.downPosition.y = y;
        return isChange;
    }
    else  {
        var points = this.points;
        for (var i = 0; i < points.length; i++) {
            if (points[i].capture(x, y, ratio * 5, svg.ratio)) {
                return true;
            }
        }
        this.downPosition.x = x;
        this.downPosition.y = y;
        return isChange;
    }
};
PolyProto.prototype.receiveUpMethod = function () {
    if (this.currentStep === 1) {
        if (!this.isMove) {
            this.points[0] = new Point(this.downPosition.x, this.downPosition.y);
            this.downPosition = {};
            this.isMove = false;
            this.setStep(2);
            return true;
        }
        this.isMove = false;
        return false;
    }
    else {
        var points = this.points;
        for (var i = 0; i < points.length; i++) {
            if (points[i].isEdit) {
                this.thirdSettings = points[i].getSetting();
                this.editPoint = points[i];
                this.isMove = false;
                return true;
            }
        }
        if (!this.isMove) {
            points.push(new Point(this.downPosition.x, this.downPosition.y));
            this.downPosition = {};
            this.isMove = false;
            return true;
        }
        this.isMove = false;
        return false;
    }
}