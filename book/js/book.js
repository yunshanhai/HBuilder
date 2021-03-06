var book;

d3.json('./json/book.json', function(data) {
  // cl(data)
  book = data;
  initBook(book)
})

var pages
// var currentPage //当前页面,暂时未用到
// var currentElement
var shapePointIds = d3.set(['topPoint', 'rightPoint', 'bottomPoint', 'leftPoint'])
var dragPointIds = d3.set(['dragPoint00', 'dragPoint01', 'dragPoint10', 'dragPoint11'])
var dragPointWidth = 16
var lockElementId = ''
// var aa = '';
var dragPointId = ''

function getPageContainerSize() {
  var container = {
    width: config.pageContainerWidth,
    height: config.pageContainerWidth * book.height / book.width,
    scale: config.pageContainerWidth / book.width
  }
  return container
}

/**
 * 移除形状的所有指示点和拖动层：中心指示点（锁定状态下）、四角拖拽指示点、拖动层
 * @param {Object} pageRootSvg
 */
function removeElementPointsAndDragLevel(pageRootSvg) {
  //移除中心指示点(锁定)
  shapePointIds.forEach(function(value) {
    pageRootSvg.select('#' + value + 'Lock').remove()
  })
  //移除拖动层
  pageRootSvg.select('#dragLevel').remove()
  //移除四角拖拽指示点
  dragPointIds.forEach(function(value) {
    pageRootSvg.select('#' + value).remove()
  })
}

function initBook(data) {
  pages = d3.map(data.pages, function(d) {
    return d.id
  })

  book.width = mm2px(book.init.width, config.dpi)
  book.height = mm2px(book.init.height, config.dpi)

  //页面除去出血之后的上下左右
  book.top = mm2px(book.init.bleed.top, config.dpi)
  book.right = book.width - mm2px(book.init.bleed.right, config.dpi)
  book.bottom = book.height - mm2px(book.init.bleed.bottom, config.dpi)
  book.left = mm2px(book.init.bleed.left, config.dpi)

  cl(book)

  var pageContainer = getPageContainerSize()

  var svgConvas = d3.select('#svgConvas')
  var defs = svgConvas.append('defs')
  // .style('width', pageContainer.width + 'px')
  // .style('height', pageContainer.height + 'px')
  //白色背景
  var rect_bg = svgConvas.append('rect').attr('id', 'rect_bg')
  rect_bg.attr('width', pageContainer.width)
    .attr('height', pageContainer.height)
    .style('fill', 'white');
  
  //网格
  var grid = defs.append('pattern')
    .attr('id', 'grid')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', config.gridSize)
    .attr('height', config.gridSize)
    .attr('patternUnits', 'userSpaceOnUse');

  grid.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', config.gridSize)
    .attr('y2', 0)
    .style('stroke', 'gray')

  grid.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', config.gridSize)
    .style('stroke', 'gray')

  var rect_grid = svgConvas.append('rect').attr('id', 'rect_grid')
  rect_grid.attr('width', pageContainer.width)
    .attr('height', pageContainer.height)
    .style('fill', 'url(#grid)');

  //出血线
  var points = [
    [book.left * pageContainer.scale, book.top * pageContainer.scale],
    [book.right * pageContainer.scale, book.top * pageContainer.scale],
    [book.right * pageContainer.scale, book.bottom * pageContainer.scale],
    [book.left * pageContainer.scale, book.bottom * pageContainer.scale]
  ]
  var line = d3.svg.line()
    .x(function(d) {
      return d[0]
    })
    .y(function(d) {
      return d[1]
    })
    .interpolate('linear-closed')

  svgConvas.append('path')
    .attr('d', line(points))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('stroke-dasharray', '5,5')

  var pageRootSvg = svgConvas.append('svg')
    // .datum(book.pages[0])
    .attr('width', pageContainer.width)
    .attr('height', pageContainer.height)
    .attr('viewBox', '0 0 ' + book.width + ' ' + book.height)

  initPage(pageRootSvg, book.pages[0])

  pageRootSvg.on('click', function(d) {
    cl('svg click')

    if (lockElementId) {
      // aa = lockElementId;
      // cl(pageRootSvg.select('#' + lockElementId).datum())
      removeElementPointsAndDragLevel(pageRootSvg)
      lockElementId = ''

    }
  })
}

function initPage(pageRootSvg, pageData) {

  var defs = pageRootSvg.append('defs')

  //初始化页面元素
  for (var i = 0; i < pageData.elements.length; i++) {
    // console.log(element)
    drawElement(pageRootSvg, defs, pageData.elements[i], i)
  }
}

function drawElement(pageRootSvg, defs, elementData, index) {
  var update = true
  var shape = pageRootSvg.select('#' + config.elementIdPrefix + index)
  if (shape.empty()) {
    update = false
    shape = pageRootSvg.append(elementData.shape)
      .attr('id', config.elementIdPrefix + index)
      .datum(elementData)

    //元素样式赋值
    Object.keys(elementData.styles).forEach(function(key) {
      shape.style(key, elementData.styles[key])
    })

    //计算并且生成元素的关键坐标点
    calcShapePoints(elementData)

    //元素属性赋值
    Object.keys(elementData.properties).forEach(function(key) {
      shape.attr(key, elementData.properties[key])
    })

    //-------------------------------元素鼠标移入---------------------------------
    shape.on('mouseover', function(d, i) {
        cl('shape mouseover')
        // cl(d);
        if (lockElementId === d3.select(this).attr('id') || d3.event.relatedTarget == null || shapePointIds.has(d3.event
            .relatedTarget.id)) {
          return
        }
        //初始化元素选择指示点
        // shapePointIds.forEach(function(value){
        //   drawElementPoint(pageRootSvg, d.points[value.replace('Point', '')], value)
        // })
        drawElementPoint(pageRootSvg, d.points.top, 'topPoint')
        drawElementPoint(pageRootSvg, d.points.right, 'rightPoint')
        drawElementPoint(pageRootSvg, d.points.bottom, 'bottomPoint')
        drawElementPoint(pageRootSvg, d.points.left, 'leftPoint')
      })
      //-------------------------------元素鼠标移出---------------------------------
      .on('mouseout', function(d) {
        cl('shape mouseout')
        if (lockElementId === d3.select(this).attr('id') || shapePointIds.has(d3.event.relatedTarget.id)) {
          return
        }
        //移除元素选择点
        shapePointIds.forEach(function(value) {
          pageRootSvg.select('#' + value).remove()
        })
      })
      //-------------------------------元素选中事件---------------------------------
      .on('click', function(d) {
        cl('shape click')
        event.cancelBubble = true

        //如果选中了另外一个元素，移除上一个锁定元素的指示点,拖动点,拖动层
        if (lockElementId && lockElementId !== d3.select(this).attr('id')) {
          removeElementPointsAndDragLevel(pageRootSvg)
        }

        lockElementId = d3.select(this).attr('id')
        // cl(d);
        // cl(pageRootSvg.select('#' + lockElementId).datum());
        //锁定元素指示点(修改为id+Lock)
        shapePointIds.forEach(function(value) {
          pageRootSvg.select('#' + value).attr('id', value + 'Lock')
        })

        drawLockElements(pageRootSvg, d.points)

      })
  } else {
    elementData = shape.datum();
    calcShapePointsAndPropertiesFromDragPoints(elementData)

    //元素属性赋值
    Object.keys(elementData.properties).forEach(function(key) {
      shape.attr(key, elementData.properties[key])
    })

    drawElementPoint(pageRootSvg, elementData.points.top, 'topPointLock')
    drawElementPoint(pageRootSvg, elementData.points.right, 'rightPointLock')
    drawElementPoint(pageRootSvg, elementData.points.bottom, 'bottomPointLock')
    drawElementPoint(pageRootSvg, elementData.points.left, 'leftPointLock')

    drawLockElements(pageRootSvg, elementData.points)
  }

}

function drawLockElements(pageRootSvg, points) {
  //绘制拖动层
  var update = true;
  var dragLevel = pageRootSvg.select('#dragLevel')
  if (dragLevel.empty()) {
    update = false
    dragLevel = pageRootSvg.append('rect').attr('id', 'dragLevel')
    var drag = d3.behavior.drag()
      .origin(function(d) {
        return {
          x: points.center[0],
          y: points.center[1]
        }
      })
      .on('dragstart', function(d) {
        cl('拖动层dragstart')
      })
      .on('dragend', function(d) {
        event.cancelBubble = true
        cl('拖动层dragend')
      })
      .on('drag', function(d) {
        var lockElementData = pageRootSvg.select('#' + lockElementId).datum()

        var eventX = d3.event.x
        var eventY = d3.event.y

        lockElementData.points.center = [eventX, eventY]
        calcShapePointsAndPropertiesFromCenterPoints(lockElementData)

        drawLockElements(pageRootSvg, lockElementData.points)
        drawElement(pageRootSvg, null, null, lockElementId.replace(config.elementIdPrefix, ''))
      })
    dragLevel.call(drag)
  }

  dragLevel.attr('x', points.tl[0])
    .attr('y', points.tl[1])
    .attr('width', points.tr[0] - points.tl[0])
    .attr('height', points.bl[1] - points.tl[1])

  if (!update) {
    dragLevel.style('stroke', '#8b3838')
      .style('stroke-width', 1)
      .style('fill', 'white')
      .style('fill-opacity', 0)
      .style('cursor', 'move')
      .on('click', function() {
        event.cancelBubble = true
      })
  }

  //绘制拖动点
  drawDragPoint(pageRootSvg, points.tl, 'dragPoint00')
  drawDragPoint(pageRootSvg, points.tr, 'dragPoint01')
  drawDragPoint(pageRootSvg, points.bl, 'dragPoint10')
  drawDragPoint(pageRootSvg, points.br, 'dragPoint11')

}

/**
 * 绘制拖动点
 * @param {Object} pageRootSvg
 * @param {Object} points
 * @param {Object} id
 */
function drawElementPoint(pageRootSvg, point, id) {
  var shapePoint = pageRootSvg.select('#' + id);
  if (shapePoint.empty()) {
    shapePoint = pageRootSvg.append('circle')
      .attr('id', id)
      .style('display', 'block')
      .style('stroke', 'red')
      .style('stroke-width', 2)
      .style('fill', 'none')
  }
  shapePoint.attr('r', 8)
    .attr('cx', point[0])
    .attr('cy', point[1])

}

function drawDragPoint(pageRootSvg, point, id) {
  var update = true
  var dragPoint = pageRootSvg.select("#" + id)
  if (dragPoint.empty()) {
    update = false
    dragPoint = pageRootSvg.append('rect')
      .attr('id', id)
      .datum(point)
  }

  var square = calcSquareFromCenterPoint(point, dragPointWidth)
  // cl(square)
  dragPoint.attr('x', square.x)
    .attr('y', square.y)
    .attr('width', square.width)
    .attr('height', square.height)

  if (!update) {
    dragPoint.style('display', 'block')
      .style('stroke', 'red')
      .style('stroke-width', 2)
      .style('fill', 'white')
      .on('click', function() {
        event.cancelBubble = true
      })

    switch (id) {
      case 'dragPoint00':
        dragPoint.style('cursor', 'nw-resize')
        break
      case 'dragPoint01':
        dragPoint.style('cursor', 'ne-resize')
        break
      case 'dragPoint10':
        dragPoint.style('cursor', 'sw-resize')
        break
      case 'dragPoint11':
        dragPoint.style('cursor', 'se-resize')
        break
    }

    var drag = d3.behavior.drag()
      .origin(function(d) {
        return {
          x: d[0],
          y: d[1]
        }
      }).on('dragstart', function(d) {
        cl('拖拽开始')
        dragPointId = d3.select(this).attr('id')
        // cl(pageRootSvg.select('#' + lockElementId).datum());
        // cl(lockElementId);
      })
      .on('dragend', function(d) {
        event.cancelBubble = true
        //拖拽结束d3.event.x和y是undefined,所以拖动点的坐标更新不能放到dragend事件
        cl('拖拽结束')
        dragPointId = ''
      })
      .on('drag', function(d) {
        // event.cancelBubble = true
        var currentPoint = d3.select(this)
        // dragPointId = currentPoint.attr('id')
        // cl('拖拽中：' + currentPoint.attr('id'))

        // cl(d3.event);
        var lockElementData = pageRootSvg.select('#' + lockElementId).datum();

        var eventX = d3.event.x
        var eventY = d3.event.y
        if (lockElementData.shape === 'circle') {
          // cl('circle,x:{0},y:{1},dx:{2},dy:{3}'.format(eventX,eventY,d3.event.dx,d3.event.dy))
          // if(Math.abs(d3.event.dx) > Math.abs(d3.event.dy)){
          //   eventY = eventY - d3.event.dy + d3.event.dx
          // }else{
          //   eventX = eventX - d3.event.dx + d3.event.dy
          // }

          // eventX = d3.event.x - d3.event.dx
          // eventY = d3.event.y - d3.event.dy
          // cl('circle,x:{0},y:{1}'.format(eventX, eventY))
        }
        // cl('circle,x:{0},y:{1}'.format(eventX, eventY))

        switch (dragPointId) {
          case 'dragPoint00':
            var dataPoint01 = d3.select('#dragPoint01').datum()
            var dataPoint10 = d3.select('#dragPoint10').datum()
            if (dataPoint01[0] - eventX >= config.elementMin) {
              d[0] = eventX
              dataPoint10[0] = eventX
            }
            if (dataPoint10[1] - eventY >= config.elementMin) {
              d[1] = eventY
              dataPoint01[1] = eventY
            }
            break
          case 'dragPoint01':
            var dataPoint00 = pageRootSvg.select('#dragPoint00').datum()
            var dataPoint11 = pageRootSvg.select('#dragPoint11').datum()
            if (eventX - dataPoint00[0] >= config.elementMin) {
              d[0] = eventX
              dataPoint11[0] = eventX
            }
            if (dataPoint11[1] - eventY >= config.elementMin) {
              d[1] = eventY
              dataPoint00[1] = eventY
            }
            break
          case 'dragPoint10':
            var dataPoint00 = pageRootSvg.select('#dragPoint00').datum()
            var dataPoint11 = pageRootSvg.select('#dragPoint11').datum()
            if (dataPoint11[0] - eventX >= config.elementMin) {
              d[0] = eventX
              dataPoint00[0] = eventX
            }
            if (eventY - dataPoint00[1] >= config.elementMin) {
              d[1] = eventY
              dataPoint11[1] = eventY
            }
            break
          case 'dragPoint11':
            var dataPoint01 = pageRootSvg.select('#dragPoint01').datum()
            var dataPoint10 = pageRootSvg.select('#dragPoint10').datum()
            if (eventX - dataPoint10[0] >= config.elementMin) {
              d[0] = eventX
              dataPoint01[0] = eventX
            }
            if (eventY - dataPoint01[1] >= config.elementMin) {
              d[1] = eventY
              dataPoint10[1] = eventY
            }
            break
        }

        // d[0] = d3.event.x
        // d[1] = d3.event.y

        // cl(pageRootSvg.select('#' + lockElementId).datum())
        drawLockElements(pageRootSvg, lockElementData.points)
        drawElement(pageRootSvg, null, null, lockElementId.replace(config.elementIdPrefix, ''))
        // var square = calcSquareFromCenterPoint(d, dragPointWidth)
        // d3.select(this).attr('x', square.x)
        //   .attr('y', square.y)

        //图片的裁剪路径跟着拖动
        //图片跟着拖动

      })
    dragPoint.call(drag)
  }

}
