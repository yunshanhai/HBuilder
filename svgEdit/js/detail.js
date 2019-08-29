function Detail(config) {
    this.config = config || {
        nodeName: "section",
        className: "detail-container"
    };
    this.container = document.createElement(this.config.nodeName);
    this.container.className = this.config.className;
}

Detail.prototype = {
    initialize: function (dom) {
        dom.appendChild(this.container);

        this.changeHandler = this._changeHandler.bind(this);
        this.container.addEventListener("change", this.changeHandler, false);
    },
    _changeHandler: function (ev) {
        var target = ev.target;
        var property = target.dataset.property,
            value = target.value,
            targetStr = target.dataset.target;

        if (target.type === "checkbox") {
            value = target.checked;
        }
        layout.svg.setProperty(property, value, targetStr);
        if (targetStr != "first") {
            layout.setSetting();
        }
        layout.drawEditView();
    },
    setSetting: function (settings) {
        this.container.innerHTML = "";
        for (var j = 0; j < settings.length; j++) {
            var setting = settings[j].setting;
            if (setting.length == 0) continue;
            var dd = document.createElement("div");
            dd.className = "detail-child-container"
            var div = document.createElement("div");
            div.textContent = settings[j].title;
            var target = settings[j].target;
            div.className = "detail-title";
            dd.appendChild(div);
            for (var i = 0; i < setting.length; i++) {
                var label = this._createLabel(setting[i], setting[i].property, target, setting[i].disabled);
                dd.appendChild(label);
            }
            this.container.appendChild(dd);
        }
    },
    _createLabel: function (setting, property, target, disabled) {
        var label = document.createElement("label");
        var span = document.createElement("span");
        span.appendChild(document.createTextNode(setting.content));
        var domElement;
        if (typeof setting.value === "boolean") {
            domElement = document.createElement("input");
            domElement.type = "checkbox";
            domElement.checked = setting.value;
        }
        else if (typeof setting.value === "number") {
            if (setting.range) {
                domElement = document.createElement("input");
                domElement.type = "range";
                domElement.step = setting.step || 1;
                domElement.min = setting.range[0];
                domElement.max = setting.range[1];
                domElement.value = setting.value;
            }
            else {
                domElement = document.createElement("input");
                domElement.type ="number";
                domElement.value = setting.value;
            }
        }
        else if (typeof setting.value === "string") {
            if (setting.type === "color") {
                domElement = document.createElement("input");
                domElement.type ="color";
                domElement.value = setting.value;
            }
            else if (setting.type === "select") {
                domElement = document.createElement("select");
                for (var i = 0; i < setting.values.length; i++) {
                    var value = setting.values[i];
                    var option = new Option(value, value);
                    domElement.add(option, value === setting.value)
                }
            }
            else {
                domElement = document.createElement("input");
                domElement.type ="text";
                domElement.value = setting.value;
            }
        }

        domElement.dataset.property = property;
        domElement.dataset.target = target;
        if (disabled) domElement.disabled = true;

        label.appendChild(span);
        label.appendChild(domElement);

        return label;
    }
};