function Svg() {
    SvgProto.call(this);
    this.activeElement = null;
    this.nodeName = "svg";
    this.operations = [
        { value: "线段", action: "line", tip: "点击线段图标添加一条线段" },
        { value: "矩形", action: "rect", tip: "点击矩形图标添加一条矩形" },
        { value: "圆形", action: "circle", tip: "点击圆形图标添加一条圆形" },
        { value: "椭圆", action: "ellipse", tip: "点击椭圆图标添加一条椭圆" },
        { value: "折线", action: "polyline", tip: "点击折线图标添加一条折线" },
        { value: "多边形", action: "polygon", tip: "点击多边形图标添加一条多边形" },
        { value: "路径", action: "path", tip: "点击路径图标添加一条路径" },
        { value: "生成", action: "outer", tip: "点击导出图标会打印svg文件源代码" }
    ];
    this.settings = [
        { value: 600, property: "viewWidth", content: "视窗宽度" },
        { value: 600, property: "viewHeight", content: "视窗高度" },
        { value: 60, range: [40, 80], property: "leftX", content: "左边距" },
        { value: 20, range: [20, 60], property: "bottomY", content: "下边距" },
        { value: 20, range: [10, 40], property: "rightX", content: "右边距" },
        { value: 30, range: [10, 40], property: "topY", content: "上边距" },
        { value: true, property: "isHelp",  content: "辅助线" }
    ];

    this.viewWidth = 600;
    this.viewHeight = 600;
    this.isHelp = true;
    this.isLineScale = false;
    this.ratio = 1;
    this.leftX = 60;
    this.rightX = 20;
    this.bottomY = 20;
    this.topY = 30;
}

Svg.prototype = new SvgProto();
Svg.prototype.getOperation = function () {
    if (this.activeElement) return this.activeElement.getOperation();
    return this.operations;
};
Svg.prototype.getSetting = function () {
    if (this.activeElement) return this.activeElement.getSetting();
    var settings = this.settings;
    for (var i = 0; i < settings.length; i++) {
        settings[i].value = this[settings[i].property];
    }
    return [{ title: "一级设置", setting: settings, target: "first" }];
};
Svg.prototype.resetActiveElement = function () {
    this.activeElement = null;
};
Svg.prototype.createElement = function () {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "https://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 " + this.viewWidth + " " + this.viewHeight);
    return svg;
};
Svg.prototype.computeSvgStr = function () {
    var svg = this.createElement();
    for (var i = 0; i < this.children.length; i++) {
        svg.appendChild(this.children[i].createElement());
    }
    return svg.outerHTML;
}
Svg.prototype.addChild = function (action) {
    if (action === "outer") {
        alert(this.computeSvgStr());
        return;
    }
    var obj = Svg.keyValues[action];
    if (!obj) {
        if (this.activeElement.addChild) {
            this.activeElement.addChild(action);
        }
        return;
    }
    var node = new obj();
    if (node) {
        node.parent = this.activeElement ? this.activeElement : this;
        if (this.activeElement) {
            this.activeElement.children.push(node);
        }
        else {
            this.children.push(node);
        }
        this.activeElement = node;
    }
};
Svg.prototype.draw = function (ctx, edit) {
    this._drawAxis(ctx);
    this._drawMarkers(ctx);

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(ctx, this, this.activeElement);
    }
    if (this.activeElement) this.activeElement.draw(ctx, this);
};
Svg.prototype._drawAxis = function (ctx) {
    var ratio = this.ratio;
    var width = this.viewWidth;
    var height = this.viewHeight;
    ctx.save();
    ctx.translate(this.leftX, this.topY);
    ctx.lineWidth = 1;
    
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0.5, 0.5);
    ctx.lineTo(ratio * width + 0.5, 0.5);
    ctx.moveTo(0.5, 0.5);
    ctx.lineTo(0.5, ratio * height + 0.5);
    ctx.stroke();
    
    if (this.isHelp) {
        ctx.strokeStyle = "lightgray";
        var startTop = 40;
        var startLeft = 40;
        ctx.beginPath();
        while (startTop <= height) {
            ctx.moveTo(0.5, startTop * ratio + 0.5);
            ctx.lineTo(ratio * width + 0.5, startTop * ratio + 0.5);
            startTop += 40;
        }

        while (startLeft <= width) {
            ctx.moveTo(startLeft * ratio + 0.5, 0.5);
            ctx.lineTo(startLeft * ratio + 0.5, ratio * height + 0.5);
            startLeft += 40;
        }
        ctx.stroke();
    }

    ctx.restore();
};
Svg.prototype._drawMarkers = function (ctx) {
    var width = this.viewWidth, height = this.viewHeight,
        ratio = this.ratio;
    ctx.save();
    ctx.translate(this.leftX, this.topY);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    var startTop = 0;
    var left, top;
    while (startTop <= height) {
        left = -5;
        top = startTop * ratio;
        ctx.fillText(startTop, left, top);
        startTop += 40;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    var startLeft = 40;
    while (startLeft <= width) {
        left = startLeft * ratio;
        top = -5;
        ctx.fillText(startLeft, left, top);
        startLeft += 40;
    }
    ctx.restore();
};

Svg.prototype.receiveDownPoint = function (obj) {
    var x = (obj.x - this.leftX) / this.ratio, y = (obj.y - this.topY) / this.ratio;
    if (x >= 0 && x <= this.viewWidth && y >= 0 && y <= this.viewHeight) {
        if (this.activeElement && this.activeElement.receiveDownPoint(x, y, this)) {
            layout.setLayout();
        }
    }
    
};

Svg.prototype.receiveMovePoint = function (obj) {
    var x = (obj.x - this.leftX) / this.ratio, y = (obj.y - this.topY) / this.ratio;
    if (x >= 0 && x <= this.viewWidth && y >= 0 && y <= this.viewHeight) {
        if (this.activeElement && this.activeElement.receiveMovePoint(x, y, this)) {
            layout.setLayout();
        }
    }
};

Svg.prototype.receiveUpMethod = function () {
    if (this.activeElement && this.activeElement.receiveUpMethod()) {
        layout.setLayout();
    }
};

Svg.prototype.setProperty = function(property, value, target) {
    if (this.activeElement) this.activeElement.setProperty(property, value, target);
    else {
        SvgProto.prototype.setProperty.call(this, property, value, target);
    }
};

Svg.prototype.removeById = function (id) {
    var element = this.getElementById(id);
    element.parent.removeElement(element);
    if (element.parent === this) this.activeElement = null;
    else this.activeElement = element.parent;
    layout.setLayout();
};

Svg.prototype.setActiveById = function (id) {
    var element = this.getElementById(id);
    if (element === this) this.activeElement = null;
    else this.activeElement = element;
    layout.setLayout();
};

Svg.keyValues = {
    line: Line,
    path: Path,
    rect: Rect,
    circle: Circle,
    ellipse: Ellipse,
    polyline: Polyline,
    polygon: Polygon
}