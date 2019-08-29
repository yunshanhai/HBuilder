function Image() {
    SvgProto.call(this);

    this.settings = [
        { value: 1, property: "lineWidth", range: [1, 5], content: "线宽" },
        { value: "black", property: "stroke", type: "color", content: "颜色" },
        { value: 1, property: "strokeOpacity", range: [0, 1], step: 0.1, content: "透明度" },
        { value: "1 0", property: "strokeDashArray", content: "虚线" },
        { value: "butt", property: "strokeLinecap", type: "select", values: [
            "butt", "round", "square"
        ], content: "头尾形状" }

    ];

    this.lineWidth = 1;
    this.stroke = "black";
    this.strokeOpacity = 1;
    this.trokeDashArray = "1 0";
    this.strokeLinecap = "butt";

    this.steps = 3;
    this.currentStep = 1;

    this.stepOperations = [
        [ 
            { tip: "从画板中的坐标中选择一个点作为起点" },
        ],
        [ 
            { tip: "从画板中的坐标中选择一个点作为终点" },
            { tip: "拖拽画板中的起点改变起始位置" }, 
        ],
        [
            { tip: "拖拽画板中的起点改变起始位置" }, 
            { tip: "拖拽画板中的终点点改变结束位置" }, 
        ],
    ];

    this.operations = this.stepOperations[this.currentStep - 1];

    this.startPoint = null;
    this.endPoint = null;
}

Image.prototype =  new SvgProto();