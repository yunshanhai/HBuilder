// 测试datum()
function test_datum() {
  var str = "China";
  var body = d3.select('body');
  var p = body.selectAll("p");
  p.datum(str);

  p.text(function(d, i) {
    return "第" + i + "个元素绑定的数据是" + d;
  });
}

function test_data() {
  var dataset = ["dog", "cat", "snake"];

  var body = d3.select("body");
  // body.style("background-color", "red");
  var p = body.selectAll("p");

  p.data(dataset)
    .text(function(d, i) {
      return d;
    });

  d3.select("p").style("color", "red");
}

function test_insert() {
  d3.select("p").insert("p").text("insert p element");
}

function test_append() {
  d3.select("p").append("p").text("append p element");
}

function test_remove() {
  d3.select("#p2").remove();
}

function test_svg1(){
  var width = 300;
  var height = 300;
  var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
}

function test_svg2(){
  var dataset = [250, 10, 170, 130, 90];
  var rectHeight = 25;
  var width = 300;
  var height = 300;
  var body = d3.select("body");
  body.append("svg").attr("id", "svg1").attr("width", width).attr("height", height);
  var svg = body.select("#svg1");
  svg.append("rect");
  svg.selectAll("rect").data(dataset)
    .enter()
    .append("rect")
    .attr("x", 20)
    .attr("y", function(d, i){
      return i * rectHeight;
    })
    .attr("width", function(d){
      return d;
    })
    .attr("height", rectHeight - 2)
    .attr("fill", "steelblue");
}

function test_drag1(){
  // d3.select("#p1").call(d3.drag().on("start", started));
}