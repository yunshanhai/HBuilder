function Circle() {
    SvgProto.call(this);

    this.nodeName = "circle";
    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "#000000", property: "stroke", type: "color", content: "线条颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "线条透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: "#00ff00", property: "fill", type: "color", content: "填充色"},
        { value: 0, property: "fillOpacity", range: [0, 1], step: 0.1, content: "填充透明度" },
        { value: true, property: "isFill", content: "是否填充" },
        { value: true, property: "isStroke", content: "是否边框" },
        { value: true, property: "isShow", content: "是否显示"}
    ];

    this.lineWidth = 1;
    this.stroke = "#000000";
    this.strokeOpacity = 1;
    this.strokeDashArray = "1 0";
    this.fill = "#00ff00";
    this.fillOpacity = 1;
    this.isFill = true;
    this.isStroke = true;
    this.isShow = true;

    this.steps = 3;

    this.stepOperations = [
        [ 
            { tip: "从画板中的坐标中选择一个点作为圆心" },
        ],
        [ 
            { tip: "从画板中的坐标中选择一个点作为半径的终点位置" },
            { tip: "拖拽画板中的起点改变圆心位置" }, 
        ],
        [
            { tip: "拖拽画板中的起点改变圆心位置" }, 
            { tip: "拖拽画板中的终点点改变半径的终点位置" }, 
        ],
    ];

    this.setStep(1);
    this.startPoint = null;
    this.endPoint = null;
    this.downPosition = {};
    this.vector = new Vector();

    this.editPoint = null;
    this._r = 0;
}

Circle.prototype =  new SvgProto();

Object.defineProperties(Circle.prototype, {
    r: {
        get: function () {
            return this._r;
        },
        set: function (value) {
            this._r = value;
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

Circle.prototype.createElement = function () {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    if (this.isStroke) {
        circle.setAttribute("stroke-width", this.lineWidth);
        circle.setAttribute("stroke", this.stroke);
        circle.setAttribute("stroke-dasharray", this.strokeDashArray);
        circle.setAttribute("stroke-opacity", this.strokeOpacity);
    }
    if (this.isFill) {
        circle.setAttribute("fill", this.fill);
        circle.setAttribute("fill-opacity", this.fillOpacity);
    }   
    else {
        circle.setAttribute("fill", "none");
    }
    circle.setAttribute("r", this._r);
    circle.setAttribute("cx", this.startPoint.x);
    circle.setAttribute("cy", this.startPoint.y);
    return circle;
};

Circle.prototype.draw = function (ctx, svg, activeElement) {
    if (!this.isShow) return;
    if (this === activeElement) return;
    var ratio = (svg.isLineScale ? svg.ratio: 1), width = svg.viewWidth,
        height = svg.viewHeight, leftX = svg.leftX,
        topY = svg.topY, sRatio = svg.ratio;

    ctx.save();
    ctx.translate(leftX, topY);
    ctx.beginPath();
    ctx.rect(0, 0, width * sRatio, height * sRatio);
    ctx.clip();
    if (this.startPoint && this.endPoint) {
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * svg.ratio;
        }));
        ctx.fillStyle = utils.changeColor(this.fill, this.fillOpacity);
        var sp = this.startPoint, ep = this.endPoint, sRatio = svg.ratio;

        ctx.beginPath();
        var r = Math.sqrt((sp.x - ep.x) * (sp.x - ep.x) + (sp.y - ep.y) * (sp.y - ep.y));
        ctx.arc(sp.x * sRatio, sp.y * sRatio, r * sRatio, 0, Math.PI * 2, false);
        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();
    }
    if (svg.activeElement === this) {
        this.startPoint && this.startPoint.draw(ctx, ratio * 5, svg.ratio);
        this.endPoint && this.endPoint.draw(ctx, ratio * 5, svg.ratio);
    }
    ctx.restore();
};
Circle.prototype._setLayout = function () {
    this.vector.set(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y);
    var len = this.vector.distance();
    this.secondSettings = this.secondSettings || 
        [{ value: 0, property: "r", content: "半径" }];
    this.secondSettings[0].value = len;
    this._r = len;
};