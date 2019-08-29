function Operation(config) {
    this.config = config || {
        nodeName: "main",
        className: "operation-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;

    this.menuContainer = new Menu();
    this.editContainer = new Edit();
    this.tipContainer = new Tip();
}

Operation.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);

        this.menuContainer.initialize(this.container);
        this.editContainer.initialize(this.container);
        this.tipContainer.initialize(this.container);
    },
    setOperation: function (operations) {
        var tips = [], os = [];
        for (var i = 0; i < operations.length; i++) {
            if (operations[i].action) {
                os.push({ value: operations[i].value, action: operations[i].action });
            }
            if (operations[i].tip) {
                var o = { tip: operations[i].tip };
                if (operations[i].action) o.action = operations[i].action;
                tips.push(o);
            }
        }

        this.menuContainer.setMenu(os);
        this.tipContainer.setTips(tips);
    },
    drawEditView: function (svg) {
        this.editContainer.drawView(svg);
    }
};