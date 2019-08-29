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
        { value: true, property: "isShow", content: "是否显示"}
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
    this.isShow = true;

    this.actionList = [{
        action: 'M', points: []
    }];
    this.setStep(1);
    this.downPosition = {};
}

Path.prototype =  new SvgProto();

Path.prototype.addChild = function (action) {
    var step = Path.keyValues[action];
    this.actionList.push({ action: action, points: [] });
    this.setStep(1);
};

Path.prototype.setStep = function (step) {
    var obj = this.actionList[this.actionList.length - 1];
    var action = obj.action;
    obj.step = step;
    this.currentStep = step;
    this.operations = Path.keyValues[action].operations[this.currentStep - 1];
    layout.setOperation();
};

Path.prototype._getLastAction = function () {
    return this.actionList[this.actionList.length - 1].action;
};

Path.prototype._getActionObjByPoint = function (point) {
    var actionList = this.actionList;
    for (var i = 0; i < actionList.length; i++) {
        var points = actionList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (point === points[j]) {
                return actionList[i];
            }
        }
    }
    return null;
};

Path.prototype._capturePoint = function (x, y, r, ratio) {
    for (var i = 0; i < this.actionList.length; i++) {
        var points = this.actionList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (points[j].capture(x, y, r, ratio)) {
                return true;
            }
        }
    }
    return false;
};

Path.prototype._getEditPoint = function () {
    for (var i = 0; i < this.actionList.length; i++) {
        var points = this.actionList[i].points;
        for (var j = 0; j < points.length; j++) {
            if (points[j].isEdit) {
                return points[j];
            }
        }
    }
    return false;
};

Path.prototype.receiveDownPoint = function (x, y, svg) {
    var ratio = (svg.isLineScale ? svg.ratio: 1);
    var action = this._getLastAction();
    if (Path.keyValues[action].receiveDownPoint) return Path.keyValues[action].receiveDownPoint(this, x, y, svg);
    if (this.currentStep === 1) {
        this.downPosition.x = x;
        this.downPosition.y = y;
        return false;
    }
    else {
        if (!this._capturePoint(x, y, ratio * 5, svg.ratio)) {
            this.downPosition.x = x;
            this.downPosition.y = y;
            return false;
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

Path.prototype._getPointsByAction = function (action) {
    var actionList = this.actionList;
    
    for (var i = 0; i < actionList.length; i++) {
        var points = actionList[i].points;
        if (action === actionList[i]) {
            if (i === 0) return points;
            var point = actionList[i - 1].points.slice(-1)[0];
            return points.slice(0).unshift(point);
        }
    }
};

Path.prototype.receiveUpMethod = function () {
    var action = this._getLastAction();
    if (Path.keyValues[action].receiveUpMethod) return Path.keyValues[action].receiveUpMethod(this);
    if (!this.isMove) {
        var action = this._getLastAction();
        this.isMove = false;
        if (Path.keyValues[action].addPoint) return Path.keyValues[action].addPoint(this);
    }
    this.isMove = false;
    var point = this._getEditPoint();
    
    if (point) {
        var action = this._getActionObjByPoint(point);
        var points = this._getPointsByAction(action);
        this.secondSettings = Path.keyValues[action.action].getSetting(action.step, points);
        this.thirdSettings = point.getSetting();
        point.isEdit = false;
        return true;
    }
    return false;
}

Path.prototype._getLastPoint = function (num) {
    num = num || 1;
    var step = 0;
    var actionList = this.actionList;
    for (var i = actionList.length - 1; i >= 0; i--) {
        var points = actionList[i].points;
        for (var j = points.length - 1; j >= 0; j--) {
            step++;
            if (step === num) return points[j];
        }
    }
};

Path.prototype._getVectorByPoint = function (point) {
    var prevPoint, nextPoint;
    var actionList = this.actionList;
    for (var i = actionList.length - 1; i >= 0; i--) {
        var points = actionList[i].points;
        for (var j = points.length - 1; j >= 0; j--) {
            if (points[j] === point) {
                if (j === 0) {
                    prevPoint = actionList[i - 1].points[actionList[i - 1].points.length - 1];
                }
                else {
                    prevPoint = actionList[i].points[j - 1];
                }

                if (j === points.length - 1) {
                    nextPoint = actionList[i + 1].points[0];
                }
                else {
                    nextPoint = actionList[i].points[j + 1];
                }
            }
        }
    }

    var deltaX = prevPoint.y - nextPoint.y, deltaY = nextPoint.x - prevPoint.x;
    var len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return {
        x: deltaX / len,
        y: deltaY / len
    };
};

Path.prototype.draw = function (ctx, svg, activeElement) {
    if (!this.isShow) return;
    if (this === activeElement) return;
    ctx.save();
    var ratio = (svg.isLineScale ? svg.ratio: 1), width = svg.viewWidth,
        height = svg.viewHeight, leftX = svg.leftX,
        topY = svg.topY, sRatio = svg.ratio;

    ctx.translate(leftX, topY);
    ctx.beginPath();
    ctx.rect(0, 0, width * sRatio, height * sRatio);
    ctx.clip();

    if (this.actionList[0].points.length > 1 || this.actionList.length > 1) {
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * sRatio;
        }));
        ctx.lineJoin = this.strokeLineJoin;
        ctx.fillStyle = utils.changeColor(this.fill, this.fillOpacity);
        ctx.beginPath();
        for (var i = 0; i < this.actionList.length; i++) {
            var currentAction = this.actionList[i],
                points = currentAction.points,
                action = currentAction.action;

            var prevPoint;
            if (i > 0) {
                var prePoints = this.actionList[i - 1].points;
                prevPoint = prePoints[prePoints.length - 1];
            }

            
            if (Path.keyValues[action].draw) Path.keyValues[action].draw(ctx, points, sRatio, prevPoint);
        }

        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();
    }
    if (svg.activeElement === this) {
        for (var i = 0; i < this.actionList.length; i++) {
            var points = this.actionList[i].points;
            for (var j = 0; j < points.length; j++) {
                points[j].draw(ctx, ratio * 5, sRatio);
            }
        }
    }
    ctx.restore();
};

Path.keyValues = {
    M: {
        operations: [
            [
                { tip: "从画板中的坐标中选择一个点作为起点" },
                { tip: "拖拽画板中的点改变点位置" }
            ],
            [
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
                { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
                { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
                { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
                { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
                { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
            ]
        ],
        getSetting: function (step, points) {
            return [];
        },
        set: function (action, property, value) {
            
        },
        addPoint: function (path) {
            if (path.currentStep === 1) {
                var point = new Point(path.downPosition.x, path.downPosition.y);
                path.downPosition = {};
                path.actionList[path.actionList.length - 1].points.push(point);
                path.setStep(2);
                return true;
            }
            return false;
        },
        draw: function (ctx, points, ratio, prevPoint) {
            if (points.length === 0) return;
            ctx.moveTo(points[0].x * ratio, points[0].y * ratio);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
            }
        }
    },
    L: {
        operations: [
            [
                { tip: "从画板中的坐标中选择一个点作为线段的终点" },
                { tip: "拖拽画板中的点改变点位置" }
            ],
            [
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
                { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
                { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
                { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
                { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
                { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
            ]
        ],
        getSetting: function (step, points) {
            if (step === 1) return [];
            var distance = points[0].distance(points[1]);
            return [
                { value: distance, property: "distance", content: "距离" }
            ];
        },
        set: function (action, property, value) {

        },
        addPoint: function (path) {
            if (path.currentStep === 1) {
                var point = new Point(path.downPosition.x, path.downPosition.y);
                path.downPosition = {};
                path.actionList[path.actionList.length - 1].points.push(point);
                path.setStep(2);
                return true;
            }
            return false;
        },
        draw: function (ctx, points, ratio, prevPoint) {
            if (points.length === 0) return;
            ctx.lineTo(points[0].x * ratio, points[0].y * ratio);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
            }
        }
    },
    A: {
        operations: [
            [
                { tip: "从画板中的坐标中选择一个点作为圆弧的终点" },
                { tip: "拖拽画板中的点改变点位置" }
            ],
            [
                { tip: "从画板中的坐标中选择一个点作为椭圆弧的终点" },
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
                { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
                { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
                { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
                { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
                { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
            ]
        ],
        addPoint: function (path) {
            if (path.currentStep === 1) {
                var lastPoint = path._getLastPoint(1);

                var point = new Point(path.downPosition.x, path.downPosition.y);

                path.downPosition = {};
                path.actionList[path.actionList.length - 1].points.push(point);
                path.setStep(2);
                return true;
            }
            return false;
        },
        getSetting: function (step, points) {
            if (step === 1) return [];

            return [
                { value: 1, property: "rx", content: "x半径" },
                { value: 2, property: "ry", content: "y半径" },
                { value: 0, property: "theta", range: [0, Math.PI], step: 0.01, content: "角度" },
                { value: true, property: "isBigArc", content: "大椭圆弧" },
                { value: true, property: "isAntClockWise", content: "逆时针" }
            ];
        },
        theta: 0,
        isBigArc: false,
        isAntClockWise: true,
        set: function (property, value) {

        },
        draw: function (ctx, points, ratio, prevPoint) {
            if (points.length < 1) return;
            var x1 = prevPoint.x, y1 = prevPoint.y,
                x2 = points[0].x, y2 = points[0].y,
                d = prevPoint.distance(points[0]),
                rx = d / 2, ry = d * 2 / 3,
                theta = this.theta,
                fa = this.isBigArc, fs = this.isAntClockWise;

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
            
        },
        _arc: function (x1, y1, x2, y2) {
            var sign = x1 * y2 - x2 * y1;
            var temp = (x1 * x2 + y1 * y2) / Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
            if (temp < -1) temp = -1;
            if (temp > 1) temp = 1;
            var n = Math.acos(temp);
            if (sign > 0) return n;
            else return -n;
        }
    },
    Q: { 
        operations: [
            [
                { tip: "从画板中的坐标中选择一个点作为二次曲线的终点" },
                { tip: "拖拽画板中的点改变点位置" }
            ],
            [
                { tip: "从画板中的坐标中选择一个点作为二次曲线的终点" },
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
                { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
                { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
                { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
                { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
                { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
            ]
        ],
        getSetting: function (step, points) {
            return [
                { value: true, property: "isSmallArc", content: "小椭圆弧" },
            ];
        },
        set: function (action, property, value) {

        },
        addPoint: function (path) {
            if (path.currentStep === 1) {
                var lastPoint = path._getLastPoint(1);
                var middlePoint = new Point(
                    (path.downPosition.x + lastPoint.x) / 2,
                    (path.downPosition.y + lastPoint.y) / 2
                );

                var point = new Point(path.downPosition.x, path.downPosition.y);

                path.downPosition = {};
                path.actionList[path.actionList.length - 1].points.push(middlePoint);
                path.actionList[path.actionList.length - 1].points.push(point);
                path.setStep(2);
                return true;
            }
            return false;
        },
        draw: function (ctx, points, ratio, prevPoint) {
            if (points.length < 2) return;
            ctx.quadraticCurveTo(points[0].x * ratio, points[0].y * ratio, points[1].x * ratio, points[1].y * ratio);
            for (var i = 2; i < points.length; i++) {
                ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
            }
        }
    },
    C: {
        operations: [
            [
                { tip: "从画板中的坐标中选择一个点作为三次曲线的终点" },
                { tip: "拖拽画板中的点改变点位置" }
            ],
            [
                { tip: "从画板中的坐标中选择一个点作为三次曲线的终点" },
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" },
                { value: "线段", action: "L", tip: "点击线段图标添加一条线段" },
                { value: "椭圆弧", action: "A", tip: "点击椭圆弧图标绘制一条椭圆圆弧" },
                { value: "二次曲线", action: "Q", tip: "点击二次曲线图标绘制一段二次曲线" },
                { value: "三次曲线", action: "C", tip: "点击三次曲线图标绘制一条三次曲线" },
                { value: "关闭", action: "Z", tip: "连接到上一个平移指令的位置" }
            ]
        ],
        getSetting: function (step, points) {
            return [];
        },
        set: function (action, property, value) {

        },
        addPoint: function (path) {
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
                path.actionList[path.actionList.length - 1].points.push(ctrlPoint1);
                path.actionList[path.actionList.length - 1].points.push(ctrlPoint2);
                path.actionList[path.actionList.length - 1].points.push(point);
                path.setStep(2);
                return true;
            }
            return false;
        },
        draw: function (ctx, points, ratio, prevPoint) {
            if (points.length < 3) return;
            ctx.bezierCurveTo(points[0].x * ratio, points[0].y * ratio, points[1].x * ratio, points[1].y * ratio, points[2].x * ratio, points[2].y * ratio);
            for (var i = 3; i < points.length; i++) {
                ctx.lineTo(points[i].x * ratio, points[i].y * ratio);
            }
        }
    },
    Z: {
        operations: [
            [
                { tip: "拖拽画板中的点改变点位置" },
                { value: "平移", action: "M", tip: "点击平移图标添加一个起始点" }
            ]
        ],
        getSetting: function (step, points) {
            return [];
        },
        set: function (action, property, value) {

        },
        receiveDownPoint: function (path, x, y, svg) {
            var ratio = (svg.isLineScale ? svg.ratio: 1);
            if (!path._capturePoint(x, y, ratio * 5, svg.ratio)) {
                return false;
            }
            return true;
        },
        draw: function (ctx, points, ratio, prevPoint) {
            ctx.closePath();
        }
    },
}