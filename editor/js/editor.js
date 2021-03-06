var editor = {
  width: document.getElementById('canvas_editor').clientWidth,
  height: document.getElementById('canvas_editor').clientHeight
};
var resizeFlag = null;
window.addEventListener('resize', function(){
  if(resizeFlag){
    clearTimeout(resizeFlag);
  }
  resizeFlag = setTimeout(()=>{
    editor.width = document.getElementById('canvas_editor').clientWidth;
    editor.height = document.getElementById('canvas_editor').clientHeight;
  },300);
});

var data;
var app;

d3.json('./json/book.json', function(book) {
  
  data = {
    config : config,
    book: book,
    currentPageIndex: 0,
    //currentPage
    //currentPageSize
    //viewport
    currentSelectElementIndex: -1,
    //currentSelectedElement
    menu: {
      showList: false,
      currentList: 0,
      viewGrid: true
    },
    editor: editor
  };
  
  app = new Vue({
    el: '#app',
    data: data,
    computed: {
      //当前页数据
      currentPage: function(){
        if(this.book.pages.length===0){
          let page = {
            type: "cover",
            flag: 2, //左页0，右页1，双页2
            paper: {
              width: config.pager[book.size].width,
              height: config.pager[book.size].height,
              bleed: {
                top: config.pager[book.size].top,
                right: config.pager[book.size].right,
                bottom: config.pager[book.size].bottom,
                left: config.pager[book.size].left
              }
            },
            elements: []
          };
          this.book.pages.push(page);
          this.book.pageCatalog.cover = {
            begin: 0,
            end: 0
          };
        }
        return this.book.pages[this.currentPageIndex];
      },
      //当前页像素尺寸：宽高和出血线
      currentPageSize: function(){
        let width = mm2px(this.currentPage.paper.width, config.dpi);
        let height = mm2px(this.currentPage.paper.height, config.dpi);
        
        let pageSize = {
          width: width,
          height: height,
          top: mm2px(this.currentPage.paper.bleed.top, config.dpi),
          right: width - mm2px(this.currentPage.paper.bleed.right, config.dpi),
          bottom: height - mm2px(this.currentPage.paper.bleed.bottom, config.dpi),
          left: mm2px(this.currentPage.paper.bleed.left, config.dpi)
        };
        
        return pageSize;
      },
      //当前选中的元素
      currentSelectedElement: function(){
        if(this.currentSelectElementIndex>-1){
          return this.currentPage.elements[this.currentSelectElementIndex];
        }
        return null;
      },
      dragObj: function(){
        let obj = {
          panel: { 
            x: 0, 
            y: 0, 
            width: 0, 
            height: 0,
            tl: { x: 0, y: 0 },
            tr: { x:0, y: 0 },
            bl: { x:0, y:0 },
            br: { x:0, y:0 },
            center: {x: 0, y: 0}
          },
          line: { x1: 0, y1: 0, x2: 0, y2: 0},
          circle:{ cx:0, cy: 0},
          t: { x: 0, y: 0 },
          tr: { x: 0, y: 0 },
          r: { x: 0, y: 0 },
          br: { x: 0, y: 0 },
          b: { x: 0, y: 0 },
          bl: { x: 0, y: 0 },
          l: { x: 0, y: 0 },
          tl: { x: 0, y: 0 },
          //
          transform: ''
        };
        if(this.currentSelectElementIndex>-1){
          let element = this.currentSelectedElement;
          let halfDragPointSize = this.config.dragPointSize / 2;

          obj.panel.x = element.x;
          obj.panel.y = element.y;
          obj.panel.width = element.width;
          obj.panel.height = element.height;
          obj.panel.tl.x = element.x;
          obj.panel.tl.y = element.y;
          obj.panel.tr.x = element.x + element.width;
          obj.panel.tr.y = element.y;
          obj.panel.bl.x = element.x;
          obj.panel.bl.y = element.y + element.height;
          obj.panel.br.x = obj.panel.tr.x;
          obj.panel.br.y = obj.panel.bl.y;
          obj.panel.center.x = element.x + element.width / 2;
          obj.panel.center.y = element.y + element.height / 2;
          
          obj.line.x1 = obj.panel.center.x;
          obj.line.y1 = element.y - this.config.dragPointSize * 3;
          obj.line.x2 = obj.line.x1;
          obj.line.y2 = element.y;
          
          obj.circle.cx = obj.line.x1;
          obj.circle.cy = obj.line.y1;
          
          obj.tl.x = element.x - halfDragPointSize;
          obj.tl.y = element.y - halfDragPointSize;
          
          obj.t.x = obj.panel.center.x - halfDragPointSize;
          obj.t.y = obj.tl.y;
          
          obj.tr.x = element.x + element.width - halfDragPointSize;
          obj.tr.y = obj.t.y;
          
          obj.r.x = obj.tr.x;
          obj.r.y = obj.panel.center.y - halfDragPointSize;
          
          obj.br.x = obj.tr.x;
          obj.br.y = obj.tr.y + element.height;
          
          obj.b.x = obj.t.x;
          obj.b.y = obj.br.y;
          
          obj.bl.x = obj.tl.x;
          obj.bl.y = obj.br.y;
          
          obj.l.x = obj.tl.x;
          obj.l.y = obj.r.y;
          
          if(element.properties.angle !== 0){
            obj.transform += "rotate({0}, {1} {2})".format(element.properties.angle, obj.panel.center.x, obj.panel.center.y);
          }
        }
        return obj;
      },
      //视窗
      viewport: function(){
        let height = this.currentPageSize.height;
        let width = this.editor.width / this.editor.height * this.currentPageSize.height;
        
        return {
          width: width,
          height: height,
          // scale: scale,
          viewbox: '0 0 ' + width + ' ' + height
        }
      },
      //出血线路径
      bleedPath: function(){
        let points = [
          [this.currentPageSize.left, this.currentPageSize.top],
          [this.currentPageSize.right, this.currentPageSize.top],
          [this.currentPageSize.right, this.currentPageSize.bottom],
          [this.currentPageSize.left, this.currentPageSize.bottom]
        ]
        let line = d3.svg.line()
          .x(function(d) {
            return d[0]
          })
          .y(function(d) {
            return d[1]
          })
          .interpolate('linear-closed');
        return line(points);
      },
      //中线
      midPath: function(){
        let points = [
          [this.currentPageSize.width / 2, this.currentPageSize.top],
          [this.currentPageSize.width / 2, this.currentPageSize.bottom]
        ];
        let line = d3.svg.line()
          .x(function(d) {
            return d[0]
          })
          .y(function(d) {
            return d[1]
          })
          // .interpolate('linear-closed');
        return line(points);
      }
    },
    watch: {
      
    },
    created: function () {
      // console.log('---created');
    },
    mounted: mounted,
    beforeUpdate: function(){
      // console.log('---beforeUpdate');
    },
    updated: function(){
      // console.log('---updated');
    },
    methods: {
      //显示顶部菜单的下拉菜单
      showMenuList: function(index){
        event.stopPropagation()
        
        this.menu.currentList = index;
        if(arguments.length==2){
          this.menu.showList = arguments[1];
        }
      },
      //显示、隐藏网格
      viewGrid: function(){
        this.menu.viewGrid = !this.menu.viewGrid;
      },
      //计算element的內圆属性
      elementCircle: function(element){
        return {
          cx: element.x + element.width / 2,
          cy: element.y + element.height / 2,
          r: (element.width > element.height) ? (element.height / 2) : (element.width / 2)
        };
      },
      //计算element的内椭圆属性
      elementEllipse: function(element){
        return {
          cx: element.x + element.width / 2,
          cy: element.y + element.height / 2,
          rx: element.width / 2,
          ry: element.height / 2
        };
      },
      elementTransform: function(element){
        if(element.properties.angle !== 0){
          let cx = element.x + element.width / 2;
          let cy = element.y + element.height / 2;
          return "rotate({0}, {1} {2})".format(element.properties.angle, cx, cy);
        }
        return "";
      },
      //点击选中当前元素
      selectElement: function(index){
        event.stopPropagation();
          this.currentSelectElementIndex = index;
      },
      //画布点击
      canvasClick: function(){
        event.stopPropagation();
        this.currentSelectElementIndex = -1;
      }
    },
    filters: {
      
    }
  })
  // initBook(book)
})

// d3.select('body').on('click', function(){
//   data.menu.showList = false;
// })
document.body.addEventListener("click",function(event){
  if(data.menu.showList)
    data.menu.showList = false;
},true);