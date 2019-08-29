function Edit(config) {
    this.config = config || {
        nodeName: "section",
        className: "edit-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    this.canvas = document.createElement("canvas");
}

Edit.prototype = {
    initialize: function (dom) {
        this.container.appendChild(this.canvas);
        dom.appendChild(this.container);

        this.mousedownHandler = this._mousedownHandler.bind(this);
        this.mousemoveHandler = this._mousemoveHandler.bind(this);
        this.mouseupHandler = this._mouseupHandler.bind(this);

        this.canvas.addEventListener("mousedown", this.mousedownHandler, false);
    },
    _mousedownHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var target = ev.target;
        var rect = target.getBoundingClientRect();

        layout.svg.receiveDownPoint({
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top
        });

        document.addEventListener("mousemove", this.mousemoveHandler, false);
        document.addEventListener("mouseup", this.mouseupHandler, false);
    },
    _mousemoveHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var target = this.canvas;
        var rect = target.getBoundingClientRect();

        layout.svg.receiveMovePoint({
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top
        });
    },
    _mouseupHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        layout.svg.receiveUpMethod();
        document.removeEventListener("mousemove", this.mousemoveHandler, false);
        document.removeEventListener("mouseup", this.mouseupHandler, false);
    },
    drawView: function (svg) {
        var canvas = this.canvas;

        var width = svg.ratio * svg.viewWidth + svg.leftX + svg.rightX;
        var height = svg.ratio * svg.viewHeight + svg.topY + svg.bottomY;
        canvas.width = width;
        canvas.height = height;

        var ctx = this.ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        svg.draw(ctx, this);
    }
};