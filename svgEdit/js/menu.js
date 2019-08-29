function Menu(config) {
    this.config = config || {
        nodeName: "header",
        className: "menu-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    this.btnGroup = [];
}

Menu.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);

        this.clickHandler = this._clickHandler.bind(this);
        this.container.addEventListener("click", this.clickHandler, false);
    },
    _clickHandler: function (ev) {
        var target = ev.target;
        var action = target.dataset.action;
        if (action) {
            layout.svg.addChild(action);
            layout.setLayout();
        }
    },
    setMenu: function (ms) {
        this.container.innerHTML = "";
        for (var i = 0; i < ms.length; i++) {
            var obj = ms[i];
            var button = document.createElement("button");
            button.dataset.action = obj.action;
            button.textContent = obj.value;
            this.container.appendChild(button);
        }
    }
};