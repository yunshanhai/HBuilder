function Polyline() {
    PolyProto.call(this);

    this.nodeName = "polyline";
    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "#000000", property: "stroke", type: "color", content: "颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: "butt", property: "strokeLinecap", type: "select", values: [
            "butt", "round", "square"
        ], content: "头尾形状" },
        { value: "miter", property: "strokeLineJoin", type: "select", values: [
            "miter", "round", "bevel"
        ], content: "相交样式"},
        { value: true, property: "isShow", content: "是否显示"}
    ];

    this.lineWidth = 1;
    this.stroke = "#000000";
    this.strokeOpacity = 1;
    this.strokeDashArray = "1 0";
    this.strokeLinecap = "butt";
    this.strokeLineJoin = "miter";
    this.isShow = true;

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

Polyline.prototype =  new PolyProto();
Polyline.prototype.createElement = function () {
    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("stroke-width", this.lineWidth);
    polyline.setAttribute("stroke", this.stroke);
    polyline.setAttribute("stroke-dasharray", this.strokeDashArray);
    polyline.setAttribute("stroke-opacity", this.strokeOpacity);
    polyline.setAttribute("stroke-linecap", this.strokeLinecap);
    polyline.setAttribute("stroke-linejoin", this.strokeLineJoin);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("points", this._createPointStr());
    return polyline;
};
Polyline.prototype.draw = function (ctx, svg, activeElement) {
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
    if (this.points.length > 0) {
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.lineCap = this.strokeLinecap;
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * sRatio;
        }));
        ctx.lineJoin = this.strokeLineJoin;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x * sRatio, points[0].y * sRatio);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * sRatio, points[i].y * sRatio)
        }
        ctx.stroke();
    }
    if (svg.activeElement === this) {
        for (var i = 0; i < points.length; i++) {
            points[i].draw(ctx, ratio * 5, sRatio);
        }
    }
    ctx.restore();
};