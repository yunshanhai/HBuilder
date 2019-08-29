function Bar(config) {
    this.domElement = document.createElement(config.nodeName);
    this.domElement.className = config.className;
    this.container = config.container;
    this.drag = config.drag;

    this.layout = {};
}

Bar.prototype = {
    initialize: function () {
        this.container.appendChild(this.domElement);
        this.mousedownHandler = this._mousedownHandler.bind(this);
        this.mousemoveHandler = this._mousemoveHandler.bind(this);
        this.mouseupHandler = this._mouseupHandler.bind(this);
        this.domElement.addEventListener("mousedown", this.mousedownHandler, false);
    },
    _mousedownHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var rect = this.container.getBoundingClientRect();
        var x = ev.clientX, y = ev.clientY;
        this.layout.startX = x;
        this.layout.startY = y;
        this.containerRect = {
            width: rect.width,
            height: rect.height
        };
        document.addEventListener("mousemove", this.mousemoveHandler, false);
        document.addEventListener("mouseup", this.mouseupHandler, false);
    },
    _mousemoveHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var x = ev.clientX, y = ev.clientY;
        var deltaX = x - this.layout.startX, deltaY = y - this.layout.startY;
        this.drag({
            width: this.containerRect.width,
            deltaX: deltaX,
            deltaY: deltaY,
            height: this.containerRect.height
        });
    },
    _mouseupHandler: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        document.removeEventListener("mousemove", this.mousemoveHandler, false);
        document.removeEventListener("mouseup", this.mouseupHandler, false);
    },
    dispose: function () {
        this.domElement.removeEventListener("mousedown", this.mousedownHandler, false);

        this.mousedownHandler = null;
        this.mousemoveHandler = null;
        this.mouseupHandler = null;

        this.container.removeChild(this.domElement);
        this.domElement = null;
        this.drag = null;
        this.container = null;
        this.layout = {};
    }
}