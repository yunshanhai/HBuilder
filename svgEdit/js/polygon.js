function Polygon() {
    PolyProto.call(this);

    this.nodeName = "polygon";
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
        { value: true, property: "isFill", content: "是否填充" },
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
    this.isFill = true;
    this.isStroke = true;
    this.isShow = true;

    this.steps = 2;

    this.stepOperations = [
        [ 
            { tip: "从画板中的坐标中选择一个点作为起点" },
        ],
        [ 
            { tip: "从画板中的坐标中选择一个点新增一个点" },
            { tip: "拖拽画板中的点改变点位置" }, 
        ]
    ];

    this.setStep(1);

    this.points = [];

    this.downPosition = {};
    this.editPoint = null;
}

Polygon.prototype =  new PolyProto();
Polygon.prototype.createElement = function () {
    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    if (this.isStroke) {
        polygon.setAttribute("stroke-width", this.lineWidth);
        polygon.setAttribute("stroke", this.stroke);
        polygon.setAttribute("stroke-dasharray", this.strokeDashArray);
        polygon.setAttribute("stroke-opacity", this.strokeOpacity);
        polygon.setAttribute("stroke-linejoin", this.strokeLineJoin);
    }
    if (this.isFill) {
        polygon.setAttribute("fill", this.fill);
        polygon.setAttribute("fill-opacity", this.fillOpacity);
    }   
    else {
        polygon.setAttribute("fill", "none");
    }
    polygon.setAttribute("points", this._createPointStr());
    return polygon;
};
Polygon.prototype.draw = function (ctx, svg, activeElement) {
    if (!this.isShow) return;
    if (this === activeElement) return;
    var ratio = (svg.isLineScale ? svg.ratio: 1), width = svg.viewWidth,
        height = svg.viewHeight, leftX = svg.leftX,
        topY = svg.topY, sRatio = svg.ratio, points = this.points;

    ctx.save();
    ctx.translate(leftX, topY);
    ctx.beginPath();
    ctx.rect(0, 0, width * sRatio, height * sRatio);
    ctx.clip();
    ctx.lineWidth = this.lineWidth * ratio;
    ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
    ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
        return value * sRatio;
    }));
    ctx.lineJoin = this.strokeLineJoin;
    if (this.points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x * sRatio, points[0].y * sRatio);
        ctx.lineTo(points[1].x * sRatio, points[1].y * sRatio);
        ctx.stroke();
    }
    else if (this.points.length > 2) {
        ctx.fillStyle = utils.changeColor(this.fill, this.fillOpacity);
        ctx.beginPath();
        ctx.moveTo(points[0].x * sRatio, points[0].y * sRatio);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * sRatio, points[i].y * sRatio)
        }
        ctx.closePath();
        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();
    }
    if (svg.activeElement === this) {
        for (var i = 0; i < points.length; i++) {
            points[i].draw(ctx, ratio * 5, sRatio);
        }
    }
    ctx.restore();
};