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
      viewGrid: false
    }
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
          panel: { x: 0, y: 0, width: 0, height: 0 },
          t: { x: 0, y: 0 },
          tr: { x: 0, y: 0 },
          r: { x: 0, y: 0 },
          br: { x: 0, y: 0 },
          b: { x: 0, y: 0 },
          bl: { x: 0, y: 0 },
          l: { x: 0, y: 0 },
          tl: { x: 0, y: 0 }
        };
        if(this.currentSelectElementIndex>-1){
          let element = this.currentSelectedElement;
          let halfDragPointSize = this.config.dragPointSize / 2;
          
          obj.panel.x = element.x;
          obj.panel.y = element.y;
          obj.panel.width = element.width;
          obj.panel.height = element.height;
          
          obj.tl.x = element.x - halfDragPointSize;
          obj.tl.y = element.y - halfDragPointSize;
          
          obj.t.x = element.x + element.width / 2 - halfDragPointSize;
          obj.t.y = obj.tl.y;
          
          obj.tr.x = element.x + element.width - halfDragPointSize;
          obj.tr.y = obj.t.y;
          
          obj.r.x = obj.tr.x;
          obj.r.y = obj.tr.y + element.height / 2;
          
          obj.br.x = obj.tr.x;
          obj.br.y = obj.tr.y + element.height;
          
          obj.b.x = obj.t.x;
          obj.b.y = obj.br.y;
          
          obj.bl.x = obj.tl.x;
          obj.bl.y = obj.br.y;
          
          obj.l.x = obj.tl.x;
          obj.l.y = obj.r.y;
        }
        return obj;
      },
      //视窗
      viewport: function(){
        return {
          // width: config.viewport.width,
          // height: config.viewport.width * this.currentPageSize.height / this.currentPageSize.width,
          // scale: config.viewport.width / this.currentPageSize.width
          width: config.viewport.height / this.currentPageSize.height * this.currentPageSize.width,
          height: config.viewport.height,
          scale: config.viewport.height / this.currentPageSize.height
        }
      },
      //出血线路径
      bleedPath: function(){
        var points = [
          [this.currentPageSize.left * this.viewport.scale, this.currentPageSize.top * this.viewport.scale],
          [this.currentPageSize.right * this.viewport.scale, this.currentPageSize.top * this.viewport.scale],
          [this.currentPageSize.right * this.viewport.scale, this.currentPageSize.bottom * this.viewport.scale],
          [this.currentPageSize.left * this.viewport.scale, this.currentPageSize.bottom * this.viewport.scale]
        ]
        var line = d3.svg.line()
          .x(function(d) {
            return d[0]
          })
          .y(function(d) {
            return d[1]
          })
          .interpolate('linear-closed');
        return line(points);
      }
    },
    watch: {
      
    },
    created: function () {
      // console.log('---created');
    },
    mounted: function(){
      // console.log('---mounted');
    },
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
      //点击选中当前元素
      selectElement: function(index){
        this.currentSelectElementIndex = index;
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