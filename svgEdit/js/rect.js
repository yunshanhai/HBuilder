function Rect() {
    SvgProto.call(this);

    this.nodeName = "rect";
    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "#000000", property: "stroke", type: "color", content: "线条颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "线条透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: 2, property: "rx", content: "圆角x半径"},
        { value: 2, property: "ry", content: "圆角y半径"},
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
    this.rx = 0;
    this.ry = 0;
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
    this.startPoint = null;
    this.endPoint = null;
    this.downPosition = {};

    this.editPoint = null;

    this._width = 0;
    this._height = 0;
}

Rect.prototype =  new SvgProto();

Object.defineProperties(Rect.prototype, {
    width: {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
            this._resetWidthAndHeight(0, value);
        }
    },
    height: {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
            this._resetWidthAndHeight(1, value);
        }
    }
});

Rect.prototype.createElement = function () {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    if (this.isStroke) {
        rect.setAttribute("stroke-width", this.lineWidth);
        rect.setAttribute("stroke", this.stroke);
        rect.setAttribute("stroke-dasharray", this.strokeDashArray);
        rect.setAttribute("stroke-opacity", this.strokeOpacity);
    }
    if (this.isFill) {
        rect.setAttribute("fill", this.fill);
        rect.setAttribute("fill-opacity", this.fillOpacity);
    }   
    else {
        rect.setAttribute("fill", "none");
    }
    rect.setAttribute("rx", this.rx);
    rect.setAttribute("ry", this.ry);
    rect.setAttribute("x", this.startPoint.x);
    rect.setAttribute("y", this.startPoint.y);
    rect.setAttribute("width", this._width);
    rect.setAttribute("height", this._height);
    return rect;
};

Rect.prototype._resetWidthAndHeight = function (num, value) {
    this.endPoint.set(this._width + this.startPoint.x, this._height + this.startPoint.y);
    this.secondSettings[num].value = value;
    this.thirdSettings = null;
    if (this.editPoint) {
        this.editPoint.isEdit = false;
        this.editPoint = null;
    }
};
Rect.prototype.draw = function (ctx, svg, activeElement) {
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
        var sx = Math.min(sp.x * sRatio, ep.x * sRatio),
            sy = Math.min(sp.y * sRatio, ep.y * sRatio),
            ex = Math.max(sp.x * sRatio, ep.x * sRatio),
            ey = Math.max(sp.y * sRatio, ep.y * sRatio);
            
        ctx.beginPath();
        if (this.r === 0) {
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, sy);
            ctx.lineTo(ex, ey);
            ctx.lineTo(sx, ey);
        }
        else {
            if (this.ry > Math.abs(this.startPoint.y - this.endPoint.y) / 2) {
                this.ry = Math.abs(this.startPoint.y - this.endPoint.y) / 2;
            }
            if (this.rx > Math.abs(this.startPoint.x - this.endPoint.x) / 2) {
                this.rx = Math.abs(this.startPoint.x - this.endPoint.x) / 2
            }
            var rx = this.rx * svg.ratio, ry = this.ry * svg.ratio;

            ctx.moveTo(sx, sy + ry);
            ctx.ellipse(sx + rx, sy + ry, rx, ry, 0, Math.PI, Math.PI * 3 / 2, false);
            ctx.lineTo(ex - rx, sy);
            ctx.ellipse(ex - rx, sy + ry, rx, ry, 0, Math.PI * 3 / 2, Math.PI * 2, false);
            ctx.lineTo(ex, ey - ry);
            ctx.ellipse(ex - rx, ey - ry, rx, ry, 0, 0, Math.PI / 2, false);
            ctx.lineTo(sx + rx, ey);
            ctx.ellipse(sx + rx, ey - ry, rx, ry, 0, Math.PI / 2, Math.PI, false);
        }
        ctx.closePath();
        if (this.isFill) ctx.fill();
        if (this.isStroke) ctx.stroke();
    }
    if (svg.activeElement === this) {
        this.startPoint && this.startPoint.draw(ctx, ratio * 5, svg.ratio);
        this.endPoint && this.endPoint.draw(ctx, ratio * 5, svg.ratio);
    }
    ctx.restore();
};
Rect.prototype._setLayout = function () {
    this._width = this.endPoint.x - this.startPoint.x;
    this._height = this.endPoint.y - this.startPoint.y;

    this.secondSettings = this.secondSettings || [
        { value: 0, property: "width", content: "宽" },
        { value: 0, property: "height", content: "高" }
    ];

    this.secondSettings[0].value = this._width;
    this.secondSettings[1].value = this._height;
};