function Explore(config) {
    this.config = config || {
        nodeName: "aside",
        className: "explore-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    var that = this;
    this.bar = new Bar({
        container: this.container,
        className: "explore-bar",
        nodeName: "div",
        drag: function (layout) {
            var width = layout.width + layout.deltaX;
            width = width > 100 ? (width < 400 ? width: 400) : 100;
            that.container.style.width = width + "px";
        }
    });

    this.treeContainer = new Tree();
}

Explore.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);
        this.treeContainer.initialize(this.container);
        this.bar.initialize();
    },
    setTree: function (treeObj) {
        this.treeContainer.setTree(treeObj);
    }
};