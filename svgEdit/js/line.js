function Line() {
    SvgProto.call(this);
    this.nodeName = "line";
    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "#000000", property: "stroke", type: "color", content: "颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: "butt", property: "strokeLinecap", type: "select", values: [
            "butt", "round", "square"
        ], content: "头尾形状" },
        { value: true, property: "isShow", content: "是否显示"}
    ];

    this.lineWidth = 1;
    this.stroke = "#000000";
    this.strokeOpacity = 1;
    this.strokeDashArray = "1 0";
    this.strokeLinecap = "butt";
    this.isShow = true;

    this.steps = 3;
    this.stepOperations = [
        [ 
            { tip: "从画板中的坐标中选择一个点作为起点" },
        ],
        [ 
            { tip: "从画板中的坐标中选择一个点作为终点" },
            { tip: "拖拽画板中的起点改变起始位置" }, 
        ],
        [
            { tip: "拖拽画板中的起点改变起始位置" }, 
            { tip: "拖拽画板中的终点点改变结束位置" }, 
        ],
    ];

    this.setStep(1);
    this._distance = 0;

    this.startPoint = null;
    this.endPoint = null;
    this.vector = new Vector();
    this.downPosition = {};

    this.editPoint = null;
}

Line.prototype =  new SvgProto();

Object.defineProperties(Line.prototype, {
    distance: {
        get: function () {
            return this._distance;
        },
        set: function (value) {
            this._distance = value;
            this.vector.setLength(value);
            this.endPoint.set(this.vector.x + this.startPoint.x, this.vector.y + this.startPoint.y);
            this.secondSettings[0].value = value;
            this.thirdSettings = null;
            if (this.editPoint) {
                this.editPoint.isEdit = false;
                this.editPoint = null;
            }
        }
    }
});

Line.prototype.createElement = function () {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke-width", this.lineWidth);
    line.setAttribute("stroke", this.stroke);
    line.setAttribute("stroke-dasharray", this.strokeDashArray);
    line.setAttribute("stroke-opacity", this.strokeOpacity);
    line.setAttribute("stroke-linecap", this.strokeLinecap);
    line.setAttribute("x1", this.startPoint.x);
    line.setAttribute("y1", this.startPoint.y);
    line.setAttribute("x2", this.endPoint.x);
    line.setAttribute("y2", this.endPoint.y);
    return line;
};

Line.prototype.draw = function (ctx, svg, activeElement) {
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
    if (this.startPoint && this.endPoint) {
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.lineCap = this.strokeLinecap;
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * svg.ratio;
        }));

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x * svg.ratio, this.startPoint.y * svg.ratio);
        ctx.lineTo(this.endPoint.x * svg.ratio, this.endPoint.y * svg.ratio);
        ctx.stroke();
    }
    if (svg.activeElement === this) {
        this.startPoint && this.startPoint.draw(ctx, ratio * 5, svg.ratio);
        this.endPoint && this.endPoint.draw(ctx, ratio * 5, svg.ratio);
    }
    ctx.restore();
};
Line.prototype._setLayout = function () {
    this.vector.set(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y);
    var len = this.vector.distance();
    this.secondSettings = this.secondSettings || 
        [{ value: 0, property: "distance", content: "距离" }];
    this.secondSettings[0].value = len;
    this._distance = len;
};