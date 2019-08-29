function SvgProto() {
    this.children = [];
    this.tokenId = new Date().getTime() + "" + ("000" + Math.floor(Math.random() * 10000)).slice(-5);
    this.nodeName = "svgProto";
}

SvgProto.prototype = {
    createElement: function () {
        return document.createElementNS("http://www.w3.org/2000/svg", "line");
    },
    getTree: function () {
        var obj = {
            id: this.tokenId,
            nodeName: this.nodeName,
            children: this.children.map(function (node) {
                return node.getTree();
            })
        };
        return obj;
    },
    getOperation: function () {
        return this.operations;
    },
    removeElement: function (element) {
        for (var i = 0; i < this.children.length; i++) {
            if (element === this.children[i]) {
                break;
            }
        }
        this.children.splice(i, 1);
    },
    getElementById: function (id) {
        if (this.tokenId === id) {
            return this;
        }
        else {
            for (var i = 0; i < this.children.length; i++) {
                var node = this.children[i].getElementById(id);
                if (node) {
                    return node;
                }
            }
        }

        return false;
    },
    getSetting: function () {
        var settings = this.settings;
        var array = [];
        for (var i = 0; i < settings.length; i++) {
            settings[i].value = this[settings[i].property];
        }
        array.push({ title: "一级设置", setting: settings, target: "first" });
        if (this.secondSettings) {
            array.push({ title: "二级设置", setting: this.secondSettings, target: "second" });
        }
        if (this.thirdSettings) {
            array.push({ title: "三级设置", setting: this.thirdSettings, target: "third" });
        }
        return array;
    },
    setProperty: function (property, value, target) {
        if (typeof this[property] === "string") {
            value += "";
        }
        else if (typeof this[property] === "boolean") {
            value = !!value;
        }
        else if (typeof this[property] === "number") {
            value = parseFloat(value);
        }
        if (target === "first") {
            this.setFirstProperty(property, value);
        }
        else if (target === "second") {
            this.setSecondProperty(property, value);
        }
        else {
            this.setThirdProperty(property, value);
        }
    },
    draw: function (ctx) {},
    setStep: function (step) {
        this.currentStep = step;
        this.operations = this.stepOperations[this.currentStep - 1];
        layout.setOperation();
        layout.setSetting();
    },
    setFirstProperty: function (property, value) {
        this[property] = value;
    },
    setSecondProperty: function (property, value) {
        this[property] = value;
    },
    setThirdProperty: function (property, value) {
        if (this.editPoint) {
            if (property === "x") {
                this.editPoint.set(parseFloat(value), this.editPoint.y);
            }
            else {
                this.editPoint.set(this.editPoint.x, parseFloat(value));
            }
            this.thirdSettings = this.editPoint.getSetting();
            if (this.secondChange) {
                this.secondChange();
            }
        }
    },
    receiveMovePoint: function (x, y, obj) {
        if (this.currentStep === 1) {
            this.isMove = true;
            return false;
        }
        else if (this.currentStep === 2) {
            if (this.startPoint.isEdit) {
                this.startPoint.set(x, y);
                return true;
            }
            this.isMove = true;
            return false;
        }
        else {
            if (this.startPoint.isEdit) {
                this.startPoint.set(x, y);
                return true;
            } 
            else if (this.endPoint.isEdit) {
                this.endPoint.set(x, y);
                return true;
            }
            return false;
        }
    },
    receiveDownPoint: function (x, y, svg) {
        var isChange = false;
        if (this.startPoint) {
            this.startPoint.isEdit = false;
            isChange = true;
        }
        if (this.endPoint) {
            this.endPoint.isEdit = false;
            isChange = true;
        } 
        var ratio = (svg.isLineScale ? svg.ratio: 1);
        if (this.currentStep === 1) {
            this.downPosition.x = x;
            this.downPosition.y = y;
            return isChange;
        }
        else if (this.currentStep === 2) {
            if (!this.startPoint.capture(x, y, ratio * 5, svg.ratio)) {
                this.downPosition.x = x;
                this.downPosition.y = y;
                return isChange;
            }
            return true;
        }
        else {
            if (this.startPoint.capture(x, y, ratio * 5, svg.ratio) || this.endPoint.capture(x, y, ratio * 5, svg.ratio)) return true;
            return isChange
        }
    },
    receiveUpMethod: function () {
        if (this.currentStep === 1) {
            if (!this.isMove) {
                this.startPoint = new Point(this.downPosition.x, this.downPosition.y);
                this.downPosition = {};
                this.isMove = false;
                this.setStep(2);
                return true;
            }
            this.isMove = false;
            return false;
        }
        else if (this.currentStep === 2) {
            if (this.startPoint.isEdit) {
                this.thirdSettings = this.startPoint.getSetting();
                this.editPoint = this.startPoint;
                return true;
            }
            else if (!this.isMove) {
                this.endPoint = new Point(this.downPosition.x, this.downPosition.y);
                this._setLayout();
                this.downPosition = {};
                this.isMove = false;
                this.setStep(3);
                return true;
            }
            this.isMove = false;
            return false;
        }
        else {
            if (this.startPoint.isEdit) {
                this.thirdSettings = this.startPoint.getSetting();
                this._setLayout();
                this.editPoint = this.startPoint;
                return true;
            }
            else if (this.endPoint.isEdit) {
                this.thirdSettings = this.endPoint.getSetting();
                this._setLayout();
                this.editPoint = this.endPoint;
                return true;
            }
            this.isMove = false;
            return false;
        }
    },
    secondChange: function () {
        this._setLayout();
    },
    _setLayout: function () {}
}