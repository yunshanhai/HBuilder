let mounted = function() {
  console.log('---mounted');
  let that = this;
  
  //拖动层
  let dragPanel = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      let dy = Math.round(d3.event.dy);
      
      element.x += dx;
      element.y += dy;
      
      if (element.type === 'image') {
        element.image.x += dx;
        element.image.y += dy;
      }
    });
  // let dragPanelElement = d3.select('#dragPanel');
  d3.select('#dragPanel')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragPanel);
  

  //左上拖动点
  let dragTL = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      let dy = Math.round(d3.event.dy);
      
      element.x += dx;
      element.y += dy;
      element.width -= dx;
      element.height -= dy;
      
      if (element.type === 'image') {
        element.image.x += dx;
        element.image.y += dy;
        element.image.width -= dx;
        element.image.height -= dy;
      }
    });
  d3.select('#dragPointTL')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragTL);
  
  //上拖动点
  let dragT = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dy = Math.round(d3.event.dy);
      
      element.y += dy;
      element.height -= dy;
      
      if (element.type === 'image') {
        element.image.y += dy;
        element.image.height -= dy;
      }
    });
  d3.select('#dragPointT')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragT);
  
  //右上拖动点
  let dragTR = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      let dy = Math.round(d3.event.dy);
      
      element.y += dy;
      element.width += dx;
      element.height -= dy;
      
      if (element.type === 'image') {
        element.image.y += dy;
        element.image.width += dx;
        element.image.height -= dy;
      }
    });
  d3.select('#dragPointTR')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragTR);
  
  //右拖动点
  let dragR = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      
      element.width += dx;
      
      if (element.type === 'image') {
        element.image.width += dx;
      }
    });
  d3.select('#dragPointR')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragR);
  
  //右下拖动点
  let dragBR = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      let dy = Math.round(d3.event.dy);
      
      element.width += dx;
      element.height += dy;
      
      if (element.type === 'image') {
        element.image.width += dx;
        element.image.height += dy;
      }
    });
  d3.select('#dragPointBR')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragBR);
  
  //下拖动点
  let dragB = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dy = Math.round(d3.event.dy);
      
      element.height += dy;
      
      if (element.type === 'image') {
        element.image.height += dy;
      }
    });
  d3.select('#dragPointB')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragB);
  
  //左下拖动点
  let dragBL = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      let dy = Math.round(d3.event.dy);
      
      element.x += dx;
      element.width -= dx;
      element.height += dy;
      
      if (element.type === 'image') {
        element.image.x += dx;
        element.image.width -= dx;
        element.image.height += dy;
      }
    });
  d3.select('#dragPointBL')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragBL);
  
  //左拖动点
  let dragL = d3.behavior.drag()
    .origin(function(d) {
      return that.dragObj.panel.tl;
    })
    .on("drag", function(d) {
      let element = that.currentSelectedElement;
      let dx = Math.round(d3.event.dx);
      
      element.x += dx;
      element.width -= dx;
      
      if (element.type === 'image') {
        element.image.x += dx;
        element.image.width -= dx;
      }
    });
  d3.select('#dragPointL')
  .on('click',function() {
    event.stopPropagation();
  })
  .call(dragL);
}
