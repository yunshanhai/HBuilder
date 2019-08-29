function Tip(config) {
    this.config = config || {
        nodeName: "footer",
        className: "tip-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    var that = this;
    this.bar = new Bar({
        container: this.container,
        className: "tip-bar",
        nodeName: "div",
        drag: function (layout) {
            var height = layout.height - layout.deltaY;
            height = height > 80 ? (height < 200 ? height: 200) : 80;
            that.container.style.height = height + "px";
        }
    });

    this.groupContainer = new Group();
}

Tip.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);

        this.bar.initialize();
        this.groupContainer.initialize(this.container);
    },
    setTips: function (ts) {
        this.groupContainer.setTips(ts);
    }
};