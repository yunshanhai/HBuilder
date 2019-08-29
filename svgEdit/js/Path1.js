function Path() {
    SvgProto.call(this);

    this.nodeName = "path";
    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "#000000", property: "stroke", type: "color", content: "颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: "miter", property: "strokeLineJoin", type: "select", values: [
            "miter", "round", "bevel"
        ], content: "相交样式"},
        { value: "#00ff00", property: "fill", type: "color", content: "填充色"},
        { value: 0, property: "fillOpacity", range: [0, 1], step: 0.1, content: "填充透明度" },
        { value: false, property: "isFill", content: "是否填充" },
        { value: true, property: "isStroke", content: "是否边框" },
    ];

    this.lineWidth = 1;
    this.stroke = "#000000";
    this.strokeOpacity = 1;
    this.strokeDashArray = "1 0";
    this.strokeLineJoin = "miter";
    this.fill = "#00ff00";
    this.fillOpacity = 1;
    this.isFill = false;
    this.isStroke = true;

    this.pathList = [new Path.keyValues.M(this)];
    this.setStep(1);
    this.downPosition = {};
}

Path.prototype =  new SvgProto();

Path.prototype.createElement = function () {
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.isStroke) {
        path.setAttribute("stroke-width", this.lineWidth);
        path.setAttribute("stroke", this.stroke);
        path.setAttribute("stroke-dasharray", this.strokeDashArray);
        path.setAttribute("stroke-opacity", this.strokeOpacity);
        path.setAttribute("stroke-linejoin", this.strokeLineJoin);
    }
    if (this.isFill) {
        path.setAttribute("fill", this.fill);
        path.setAttribute("fill-opacity", this.fillOpacity);
    }   
    else {
        path.setAttribute("fill", "none");
    }
    path.setAttribute("points", this._createPathStr());
    return path;
};

Path.prototype._createPathStr = function () {
    var strArray = [], pathList = this.pathList;
    for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        strArray.push(path._toString());
    }
    return strArray.join(" ");
};

Path.prototype.addChild = function (action, point) {
    var selfPath = new Path.keyValues[action](this);
    this.pathList.push(selfPath);
    if (point) {
        selfPath.points.push(point);
        this.setStep(2);
    }
    else {
        this.setStep(1);
    }
};

Path.prototype.setStep = function (step) {
    var obj = this.pathList[this.pathList.length - 1];
    obj.step = step;
    this.currentStep = step;
    this.operations = obj.operations[this.currentStep - 1];
    layout.setOperation();
};

Path.prototype._getLastPath = function () {
    return this.pathList[this.pathList.length - 1];
};

Path.prototype._getPathByPoint = function (point) {
    var pathList = this.pathList;
    for (var i = 0; i < pathList.length; i++) {
        var points = pathList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (point === points[j]) {
                return pathList[i];
            }
        }
    }
    return null;
};

Path.prototype._capturePoint = function (x, y, r, ratio) {
    for (var i = 0; i < this.pathList.length; i++) {
        var points = this.pathList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (points[j].capture(x, y, r, ratio)) {
                return true;
            }
        }
    }
    return false;
};

Path.prototype._getEditPoint = function () {
    for (var i = 0; i < this.pathList.length; i++) {
        var points = this.pathList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (points[j].isEdit) {
                return points[j];
            }
        }
    }
    return false;
};

Path.prototype.receiveDownPoint = function (x, y, svg) {
    var isChange = false;
    var point = this._getEditPoint();
    if (point) {
        point.isEdit = false;
        isChange = true;
    }
    var ratio = (svg.isLineScale ? svg.ratio: 1);
    var selfPath = this._getLastPath();
    if (selfPath.receiveDownPoint) return selfPath.receiveDownPoint(x, y, svg);
    if (this.currentStep === 1) {
        this.downPosition.x = x;
        this.downPosition.y = y;
        return isChange;
    }
    else {
        if (!this._capturePoint(x, y, ratio * 5, svg.ratio)) {
            this.downPosition.x = x;
            this.downPosition.y = y;
            return isChange;
        }
        return true;
    }
};

Path.prototype.receiveMovePoint = function (x, y, svg) {
    var point = this._getEditPoint();
    this.isMove = true;
    if (point) {
        point.set(x, y);
        return true;
    }
    return false;
};

Path.prototype._getPointsByPath = function (path) {
    var pathList = this.pathList;
    
    for (var i = 0; i < pathList.length; i++) {
        var points = pathList[i].points;
        if (path === pathList[i]) {
            if (i === 0) return points;
            var point = pathList[i - 1].points.slice(-1)[0];
            var ps = points.slice(0);
            ps.unshift(point);
            return ps;
        }
    }
};

Path.prototype.receiveUpMethod = function () {
    var selfPath = this._getLastPath();
    var prevPoint = this._getLastPoint(1);
    if (selfPath.receiveUpMethod) return selfPath.receiveUpMethod();
    if (!this.isMove) {
        this.isMove = false;
        if (selfPath.addPoint) {
            return selfPath.addPoint(prevPoint);
        }
    }
    this.isMove = false;
    var point = this._getEditPoint();
    
    if (point) {
        var path = this._getPathByPoint(point);
        var points = this._getPointsByPath(path);
        this.secondSettings = path.getSetting(path.step, points[0]);
        this.thirdSettings = point.getSetting(points[0]);
        this.editPoint = point;
        return true;
    }
    return false;
}

Path.prototype._getLastPoint = function (num) {
    num = num || 1;
    var step = 0;
    var pathList = this.pathList;
    for (var i = pathList.length - 1; i >= 0; i--) {
        var points = pathList[i].points;
        for (var j = points.length - 1; j >= 0; j--) {
            if (++step === num) return points[j];
        }
    }
};

Path.prototype.setSecondProperty = function (property, value) {
    var point = this.editPoint || this._getLastPoint(1);
    var path = this._getPathByPoint(point);
    path[property] = value;
};

Path.prototype.secondChange = function () {
    var point = this.editPoint;
    if (point) {
        var selfPath = this._getPathByPoint(point);
        if (selfPath.secondChange)
            selfPath.secondChange();
    }
}

Path.prototype.draw = function (ctx, svg, activeElement) {
    if (this === activeElement) return;
    ctx.save();
    var ratio = (svg.isLineScale ? svg.ratio: 1), width = svg.viewWidth,
        height = svg.viewHeight, leftX = svg.leftX,
        topY = svg.topY, sRatio = svg.ratio;

    ctx.translate(leftX, topY);
    ctx.beginPath();
    ctx.rect(0, 0, width * sRatio, height * sRatio);
    ctx.clip();

    if (this.pathList[0].points.length > 1 || this.pathList.length > 1) {
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * sRatio;
        }));
        ctx.lineJoin = this.strokeLineJoin;
        ctx.fillStyle = utils.changeColor(this.fill, this.fillOpacity);
        ctx.beginPath();
        for (var i = 0; i < this.pathList.length; i++) {
            var prevPoint;
            if (i > 0) {
                var prePoints = this.pathList[i - 1].points;
                prevPoint = prePoints[prePoints.length - 1];
            }

            if (this.pathList[i].draw) this.pathList[i].draw(ctx, sRatio, prevPoint);
        }

        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();
    }
    if (svg.activeElement === this) {
        for (var i = 0; i < this.pathList.length; i++) {
            var points = this.pathList[i].points;
            for (var j = 0; j < points.length; j++) {
                points[j].draw(ctx, ratio * 5, sRatio);
            }
        }
    }
    ctx.restore();
};

function SelfPath(str1, str2) {
    str1 = str1 || "";
    this.operations = [
        [
            { tip: str1 },
            { tip: "拖拽画板中的点改变点位置" }
        ],
        [
            { tip: "拖拽画板中的点改变点位置" },
            { tip: "点击画板生成新的一条线段" },
            { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
            { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
            { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
            { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
            { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
            { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
        ]
    ];

    if (str2) {
        this.operations[1].unshift({ tip: str2 });
    }

    this.points = [];
}

SelfPath.prototype = {
    getSetting: function (step) {
        return [];
    },
    set: function (property, value) {
        this[property] = value;
    },
    addPoint: function () {},
    draw: function (ctx, ratio, prevPoint) {},
    _toString: function () {}
};

function MovePath(path) {
    SelfPath.call(this, "从画板中的坐标中选择一个点作为起点");
    this.action = "M";
    this.path = path;
}

MovePath.prototype = new SelfPath();

MovePath.prototype.addPoint = function (prevPoint) {
    var path = this.path;
    if (path.currentStep === 1) {
        var point = new Point(path.downPosition.x, path.downPosition.y);
        path.downPosition = {};
        this.points.push(point);
        path.setStep(2);
        path.secondSettings = this.getSetting(this.step, prevPoint);
        return true;
    }
    else {
        this.path.addChild("L", new Point(path.downPosition.x, path.downPosition.y));
        return true;
    }
    // return false;
};
MovePath.prototype.draw = function (ctx, ratio, prevPoint) {
    var points = this.points;
    if (points.length === 0) return;
    ctx.moveTo(points[0].x * ratio, points[0].y * ratio);
};
MovePath.prototype._toString = function () {
    return ["M", this.points[0].x, this.points[0].y].join(" ");
};

function LinePath(path) {
    SelfPath.call(this, "从画板中的坐标中选择一个点作为线段的终点");
    this.action = "L";
    this._distance = 0;
    this.path = path;
    this.vector = new Vector();
}

LinePath.prototype = new SelfPath();

Object.defineProperties(LinePath.prototype, {
    distance: {
        get: function () {
            return this._distance;
        },
        set: function (value) {
            this._distance = value;
            var points = this.path._getPointsByPath(this);
            this.vector.setLength(value);
            this.points[0].set(this.vector.x + points[0].x, this.vector.y + points[0].y);
            this.path.secondSettings[0].value = value;
            this.thirdSettings = null;
            if (this.path.editPoint) {
                this.path.editPoint.isEdit = false;
                this.path.editPoint = null;
            }
        }
    }
});

LinePath.prototype._toString = function () {
    return ["L", this.points[0].x, this.points[0].y].join(" ");
};

LinePath.prototype.addPoint = function (prevPoint) {
    var path = this.path;
    if (path.currentStep === 1) {
        this.vector.set(path.downPosition.x - prevPoint.x, path.downPosition.y - prevPoint.y);
        var point = new Point(path.downPosition.x, path.downPosition.y);
        path.downPosition = {};
        this.points.push(point);
        path.setStep(2);
        var prevPoint = path._getLastPoint(2);
        path.secondSettings = this.getSetting(this.step, prevPoint);
        return true;
    }
    else {
        this.path.addChild("L", new Point(path.downPosition.x, path.downPosition.y));
        return true;
    }
};

LinePath.prototype.draw = function (ctx, ratio, prevPoint) {
    var points = this.points;
    if (points.length === 0) return;
    ctx.lineTo(points[0].x * ratio, points[0].y * ratio);
};

LinePath.prototype.getSetting = function (step, prevPoint) {
    if (step === 1) return [];
    var setting = [{ value: 0, property: "distance", content: "距离" }];
    var distance = prevPoint.distance(this.points[0]);
    this.vector.set(this.points[0].x - prevPoint.x, this.points[0].y - prevPoint.y);
    this._distance = distance;
    setting[0].value = distance;
    return setting;
}

function ArcPath(path) {
    SelfPath.call(this, "从画板中的坐标中选择一个点作为圆弧的终点", "从画板中的坐标中选择一个点作为椭圆弧的终点");
    this.action = "A";
    this._theta = 0;
    this._isBigArc = false;
    this._isAntClockWise = true;
    this._rx = 0;
    this._ry = 0;
    this.path = path;
}

ArcPath.prototype = new SelfPath();

Object.defineProperties(ArcPath.prototype, {
    theta: {
        get: function () {
            return this._theta;
        },
        set: function (value) {
            this.path.secondSettings[2].value = value;
            this._theta = value;
        }
    },
    isBigArc: {
        get: function () {
            return this._isBigArc;
        },
        set: function (value) {
            this.path.secondSettings[3].value = value;
            this._isBigArc = value;
        }
    },
    isAntClockWise: {
        set: function (value) {
            this._isAntClockWise = value;
            this.path.secondSettings[4].value = value;
        },
        get: function () {
            return this._isAntClockWise;
        }
    },
    rx: {
        set: function (value) {
            this.path.secondSettings[0].value = value;
            this._rx = value;
        },
        get: function () {
            return this._rx;
        }
    },
    ry: {
        get: function () {
            return this._ry;
        },
        set: function (value) {
            this.path.secondSettings[1].value = value;
            this._ry = value;
        }
    }
});

ArcPath.prototype._toString = function () {
    return [
        "A", 
        this._rx, 
        this._ry,
        this._isBigArc ? 1 : 0,
        this._isAntClockWise ?  1: 0,
        this.points[0].x,
        this.points[0].y
    ].join(" ");
};
ArcPath.prototype.addPoint = function (prevPoint) {
    var path = this.path;
    if (path.currentStep === 1) {
        var point = new Point(path.downPosition.x, path.downPosition.y);

        path.downPosition = {};
        this.points.push(point);

        var prevSet = prevPoint.set || prevPoint.__proto__.set;
        prevPoint.set = function (x, y) {
            prevSet.call(this, x, y);
            var d = prevPoint.distance(point);
            that._rx = d / 2;
            that._ry = d / 2;
        }
        var pointSet = point.set || point.__proto__.set;
        var that = this;
        point.set = function (x, y) {
            pointSet.call(this, x, y);
            var d = prevPoint.distance(this);
            that._rx = d / 2;
            that._ry = d / 2;
        };
        var distance = prevPoint.distance(point);
        this._rx = distance / 2;
        this._ry = distance / 2;
        path.setStep(2);
        path.secondSettings = this.getSetting(this.step, prevPoint);
        return true;
    }
    else {
        this.path.addChild("L", new Point(path.downPosition.x, path.downPosition.y));
        return true;
    }
};

ArcPath.prototype.getSetting = function (step, prevPoint) {
    if (step === 1) return [];
    
    var distance = prevPoint.distance(this.points[0]);
    var setting = [
        { value: 0, property: "rx", content: "x半径" },
        { value: 0, property: "ry", content: "y半径" },
        { value: 0, property: "theta", content: "旋转角" },
        { value: true, property: "isBigArc", content: "大椭圆弧" },
        { value: true, property: "isAntClockWise", content: "逆时针" },
        { value: distance, property: "distance", content: "距离", disabled: true }
    ];
    setting[0].value = distance / 2;
    setting[1].value = distance / 2;
    setting[2].value = this._theta;
    setting[3].value = this._isBigArc;
    setting[4].value = this._isAntClockWise;
    this._rx = distance / 2;
    this._ry = distance / 2;
    return setting;
}

ArcPath.prototype.draw = function (ctx, ratio, prevPoint) {
    var points = this.points;
    if (points.length < 1) return;
    var x1 = prevPoint.x, y1 = prevPoint.y,
        x2 = points[0].x, y2 = points[0].y,
        rx = this._rx, ry = this._ry,
        theta = this._theta,
        fa = this._isBigArc, fs = this._isAntClockWise;

    var cos = Math.cos(theta), sin = Math.sin(theta);
    var nx1 = cos * (x1 - x2) / 2 + sin * (y1 - y2) / 2,
        ny1 = -sin * (x1 - x2) / 2 + cos * (y1 - y2) / 2;
    var tempNumber = (rx * rx * ry * ry - rx * rx * ny1 * ny1 - ry * ry * nx1 * nx1);
    tempNumber = tempNumber < 0 ? 0 : tempNumber;
    var tempN = Math.sqrt(
        tempNumber /
        (rx * rx * ny1 * ny1 + ry * ry * nx1 * nx1) 
    );

    if (fa !== fs) {
        tempN = -tempN;
    }
    var ncx = tempN * rx * ny1 / ry,
        ncy = -tempN * ry * nx1 / rx;

    var cx = cos * ncx - sin * ncy + (x1 + x2) / 2,
        cy = sin * ncx + cos * ncy + (y1 + y2) / 2;

    var t1 = this._arc(1, 0, (nx1 - ncx) / rx, (ny1 - ncy) / ry);
    var dt = this._arc((nx1 - ncx) / rx, (ny1 - ncy) / ry, (-nx1 - ncx) / rx, (-ny1 - ncy) / ry);
    var t2 = dt + t1;
    if (fs) {
        ctx.ellipse(cx * ratio, cy * ratio, rx * ratio, ry * ratio, theta, t1, t2, true);
    }
    else {
        ctx.ellipse(cx * ratio, cy * ratio, rx * ratio, ry * ratio, theta, t1, t2, false);
    }
};

ArcPath.prototype._arc = function (x1, y1, x2, y2) {
    var sign = x1 * y2 - x2 * y1;
    var temp = (x1 * x2 + y1 * y2) / Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
    if (temp < -1) temp = -1;
    if (temp > 1) temp = 1;
    var n = Math.acos(temp);
    if (sign > 0) return n;
    else return -n;
};

ArcPath.prototype.secondChange = function () {
    this.path.secondSettings[0].value = this._rx;
    this.path.secondSettings[1].value = this._ry;
    this.path.secondSettings[2].value = this._theta;
    this.path.secondSettings[3].value = this._isBigArc;
    this.path.secondSettings[4].value = this._isAntClockWise;
};

function QuadraticCurvePath(path) {
    SelfPath.call(this, "从画板中的坐标中选择一个点作为二次曲线的终点", "从画板中的坐标中选择一个点作为二次曲线的终点");
    this.action = "Q";
    this.path = path;
}

QuadraticCurvePath.prototype = new SelfPath();

QuadraticCurvePath.prototype.addPoint = function () {
    var path = this.path;
    if (path.currentStep === 1) {
        var lastPoint = path._getLastPoint(1);
        var middlePoint = new Point(
            (path.downPosition.x + lastPoint.x) / 2,
            (path.downPosition.y + lastPoint.y) / 2
        );

        var point = new Point(path.downPosition.x, path.downPosition.y);

        path.downPosition = {};
        this.points.push(middlePoint, point);
        path.setStep(2);
        return true;
    }
    else {
        this.path.addChild("L", new Point(path.downPosition.x, path.downPosition.y));
        return true;
    }
};

QuadraticCurvePath.prototype._toString = function () {
    return [
        "Q", 
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y
    ].join(" ");
};

QuadraticCurvePath.prototype.draw = function (ctx, ratio, prevPoint) {
    var points = this.points;
    if (points.length < 2) return;
    ctx.quadraticCurveTo(points[0].x * ratio, points[0].y * ratio, points[1].x * ratio, points[1].y * ratio);
    for (var i = 2; i < points.length; i++) {
        ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
    }
}

function BezierCurvePath(path) {
    SelfPath.call(this, "从画板中的坐标中选择一个点作为三次曲线的终点", "从画板中的坐标中选择一个点作为三次曲线的终点");
    this.action = "C";
    this.path = path;
}

BezierCurvePath.prototype = new SelfPath();

BezierCurvePath.prototype._toString = function () {
    return [
        "C", 
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
        this.points[2].x,
        this.points[2].y
    ].join(" ");
};

BezierCurvePath.prototype.addPoint = function () {
    var path = this.path;
    if (path.currentStep === 1) {
        var lastPoint = path._getLastPoint(1);
        var ctrlPoint1 = new Point(
            path.downPosition.x / 3 + lastPoint.x * 2 / 3,
            path.downPosition.y / 3 + lastPoint.y * 2 / 3
        );
        var ctrlPoint2 = new Point(
            path.downPosition.x * 2 / 3 + lastPoint.x / 3,
            path.downPosition.y * 2 / 3 + lastPoint.y / 3
        );

        var point = new Point(path.downPosition.x, path.downPosition.y);

        path.downPosition = {};
        this.points.push(ctrlPoint1, ctrlPoint2, point);
        path.setStep(2);
        return true;
    }
    else {
        this.path.addChild("L", new Point(path.downPosition.x, path.downPosition.y));
        return true;
    }
};

BezierCurvePath.prototype.draw = function (ctx, ratio, prevPoint) {
    var points = this.points;
    if (points.length < 3) return;
    ctx.bezierCurveTo(points[0].x * ratio, points[0].y * ratio, points[1].x * ratio, points[1].y * ratio, points[2].x * ratio, points[2].y * ratio);
    for (var i = 3; i < points.length; i++) {
        ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
    }
}

function ZPath(path) {
    SelfPath.call(this);
    this.operations = [
        [
            { tip: "拖拽画板中的点改变点位置" },
            { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" }
        ]
    ];
    this.action = "Z";
    this.path = path;
}

ZPath.prototype = new SelfPath();

ZPath.prototype._toString = function () {
    return "Z";
};

ZPath.prototype.receiveDownPoint = function (x, y, svg) {
    var path = this.path;
    var ratio = (svg.isLineScale ? svg.ratio: 1);
    if (!path._capturePoint(x, y, ratio * 5, svg.ratio)) {
        return false;
    }
    return true;
};

ZPath.prototype.draw = function (ctx, ratio, prevPoint) {
    ctx.closePath();
}

Path.keyValues = {
    M: MovePath,
    L: LinePath,
    A: ArcPath,
    Q: QuadraticCurvePath,
    C: BezierCurvePath,
    Z: ZPath
}