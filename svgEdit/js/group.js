function Group(config) {
    this.config = config || {
        nodeName: "section",
        className: "group-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;
}

Group.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);
    },
    setTips: function (ts) {
        this.container.innerHTML = "";
        for (var i = 0; i < ts.length; i++) {
            var a = document.createElement("a");
            if (ts[i].action) a.dataset.target = ts[i].action;
            a.textContent = ts[i].tip;
            this.container.appendChild(a);
        }
    }
};