function Ellipse() {
    SvgProto.call(this);

    this.nodeName = "ellipse";
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
            { tip: "从画板中的坐标中选择一个点作为椭圆圆心" },
        ],
        [ 
            { tip: "从画板中的坐标中选择一个点作为辅助点" },
            { tip: "拖拽画板中的起点改变椭圆圆心位置" }, 
        ],
        [
            { tip: "拖拽画板中的起点改变椭圆圆心位置" }, 
            { tip: "拖拽画板中的终点点改变辅助点位置" }, 
        ],
    ];

    this.setStep(1);
    this.startPoint = null;
    this.endPoint = null;
    this.downPosition = {};

    this.editPoint = null;

    this._rx = 0;
    this._ry = 0;
}

Ellipse.prototype =  new SvgProto();

Object.defineProperties(Ellipse.prototype, {
    rx: {
        get: function () {
            return this._rx;
        },
        set: function (value) {
            this._rx = value;
            this._resetRxAndRy(0, value);
        }
    },
    ry: {
        get: function () {
            return this._ry;
        },
        set: function (value) {
            this._ry = value;
            this._resetRxAndRy(1, value);
        }
    }
});

Ellipse.prototype._resetRxAndRy = function (num, value) {
    this.endPoint.set(this._rx + this.startPoint.x, this._ry + this.startPoint.y);
    this.secondSettings[num].value = value;
    this.thirdSettings = null;
    if (this.editPoint) {
        this.editPoint.isEdit = false;
        this.editPoint = null;
    }
};

Ellipse.prototype.createElement = function () {
    var ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    if (this.isStroke) {
        ellipse.setAttribute("stroke-width", this.lineWidth);
        ellipse.setAttribute("stroke", this.stroke);
        ellipse.setAttribute("stroke-dasharray", this.strokeDashArray);
        ellipse.setAttribute("stroke-opacity", this.strokeOpacity);
    }
    if (this.isFill) {
        ellipse.setAttribute("fill", this.fill);
        ellipse.setAttribute("fill-opacity", this.fillOpacity);
    }   
    else {
        ellipse.setAttribute("fill", "none");
    }
    ellipse.setAttribute("rx", this._rx);
    ellipse.setAttribute("ry", this._ry);
    ellipse.setAttribute("cx", this.startPoint.x);
    ellipse.setAttribute("cy", this.startPoint.y);
    return ellipse;
};

Ellipse.prototype.draw = function (ctx, svg, activeElement) {
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
        var sp = this.startPoint, ep = this.endPoint, sRatio = svg.ratio;
        ctx.lineWidth = this.lineWidth * ratio;
        ctx.strokeStyle = utils.changeColor(this.stroke, this.strokeOpacity);
        ctx.setLineDash(this.strokeDashArray.split(/\s+/).map(function (value) {
            return value * sRatio;
        }));
        ctx.fillStyle = utils.changeColor(this.fill, this.fillOpacity);

        ctx.beginPath();
        var rx = Math.abs(sp.x - ep.x), ry = Math.abs(sp.y - ep.y);
        ctx.ellipse(sp.x * sRatio, sp.y * sRatio, rx * sRatio, ry * sRatio, 0, 0, Math.PI * 2, false);
        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();

        if (svg.activeElement === this) {
            ctx.strokeStyle = "gray";
            var sx = Math.min(sp.x, ep.x);
            var sy = Math.min(sp.y, ep.y);
            ctx.setLineDash([sRatio, sRatio]);
            ctx.beginPath();
            ctx.rect(sx * sRatio, sy * sRatio, rx * sRatio, ry * sRatio);
            ctx.stroke();
        }
    }
    if (svg.activeElement === this) {
        this.startPoint && this.startPoint.draw(ctx, ratio * 5, svg.ratio);
        this.endPoint && this.endPoint.draw(ctx, ratio * 5, svg.ratio);
    }
    ctx.restore();
};
Ellipse.prototype._setLayout = function () {
    this._rx = this.endPoint.x - this.startPoint.x;
    this._ry = this.endPoint.y - this.startPoint.y;

    this.secondSettings = this.secondSettings || [
        { value: 0, property: "rx", content: "x轴半径" },
        { value: 0, property: "ry", content: "y轴半径" }
    ];

    this.secondSettings[0].value = this._rx;
    this.secondSettings[1].value = this._ry;
};