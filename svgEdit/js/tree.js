function Tree(config) {
    this.config = config || {
        nodeName: "section",
        className: "tree-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;
}

Tree.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);
        this.clickHandler = this._clickHandler.bind(this);
        this.container.addEventListener("click", this.clickHandler, false);
    },
    _getLi: function (target) {
        var nodeName = target.nodeName.toUpperCase();
        while (target.nodeName.toUpperCase() !== "LI") {
            target = target.parentNode;
            if (!target) return null;
        }
        return target;
    },
    _clickHandler: function (ev) {
        var target = ev.target, li = this._getLi(target);
        if (!li) return false;
        var id = li.dataset.id;
        if (target.dataset.action === "close") {
            ev.stopPropagation();
            layout.svg.removeById(id);
        }
        else {
            layout.svg.setActiveById(id);
        }
    },
    setTree: function (treeObj) {
        this.container.innerHTML = "";
        var ul = document.createElement("ul");
        ul.appendChild(this._setDom(treeObj));
        this.container.appendChild(ul);
    },
    _setDom: function (treeObj, isRemove) {
        var fragment = document.createDocumentFragment();
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(treeObj.nodeName));
        
        if (isRemove) {
            var closeSpan = document.createElement("span");
            closeSpan.textContent = "X";
            closeSpan.dataset.action = "close";
            li.appendChild(closeSpan);
        }
        
        li.dataset.id = treeObj.id;
        fragment.appendChild(li);

        if (treeObj.children.length > 0) {
            var ul = document.createElement("ul");
            for (var i = 0; i < treeObj.children.length; i++) {
                ul.appendChild(this._setDom(treeObj.children[i], true));
            }
            fragment.appendChild(ul);
        }

        return fragment;
    }
};