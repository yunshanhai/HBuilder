function Setting(config) {
    this.config = config || {
        nodeName: "aside",
        className: "setting-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    var that = this;
    this.bar = new Bar({
        container: this.container,
        className: "setting-bar",
        nodeName: "div",
        drag: function (layout) {
            var width = layout.width - layout.deltaX;
            width = width > 250 ? (width < 400 ? width: 400) : 250;
            that.container.style.width = width + "px";
        }
    });

    this.detailContainer = new Detail();
}

Setting.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);
        this.bar.initialize();
        this.detailContainer.initialize(this.container);
    },
    setSetting: function (setting) {
        this.detailContainer.setSetting(setting);
    }
};