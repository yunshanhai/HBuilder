function Layout() {
    this.treeContainer = new Explore();
    this.operationContainer = new Operation();
    this.settingContainer = new Setting();

    this.svg = new Svg();
}

Layout.prototype = {
    initialize: function (dom) {
        dom = dom || document.body;
        this.treeContainer.initialize(dom);
        this.operationContainer.initialize(dom);
        this.settingContainer.initialize(dom);

        this.setLayout();
    },
    setLayout: function () {
        this.setTree();
        this.drawEditView();
        this.setOperation();
        this.setSetting();
    },
    drawEditView: function () {
        this.operationContainer.drawEditView(this.svg);
    },
    setOperation: function () {
        this.operationContainer.setOperation(this.svg.getOperation());
    },
    setTree: function () {
        this.treeContainer.setTree(this.svg.getTree());
    },
    setSetting: function () {
        this.settingContainer.setSetting(this.svg.getSetting());
    }
}