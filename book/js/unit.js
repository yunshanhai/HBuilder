/**
 * cl:consoel.log的函数缩写
 * @param {Object} message
 */
function cl(message) {
  console.log(message)
}

/**
 * 输出信息到页面 console message to page
 * @param {Object} message 要输出的信息
 * @param {Object} position 0为插入到body的最前面，1为append到body最后一个元素
 */
function c2p(message, position = 0) {
  var c2p

  if (position === 0) {
    c2p = d3.select('body').select('#c2p0')
    if (c2p.empty()) {
      c2p = d3.select('body').insert('div', '*:first-child').attr('id', 'c2p0')
    }

  } else {
    c2p = d3.select('body').select('#c2p1')
    if (c2p.empty()) {
      c2p = d3.select('body').append('div').attr('id', 'c2p1')
    }
  }
  c2p.append('p').text(message)
}

/**
 * '{0}{1}'.format('0', '1')
 * '{key0, key1}'.format({key0:'value0', key1:'value1'})
 * @param {Object} args
 */
String.prototype.format = function(args) {
  var result = this
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof(args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g")
          result = result.replace(reg, args[key])
        }
      }
    } else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g")
          result = result.replace(reg, arguments[i])
        }
      }
    }
  }
  return result
}

/**
 * 像素转毫米，默认96dpi
 * @param {Integer} px 像素
 * @param {Integer} dpi 
 */
function px2mm(px, dpi = 96) {
  return px * 25.4 / dpi
}

/**
 * 毫米转像素，默认96dpi
 * @param {Integer} px 像素
 * @param {Integer} dpi 
 */
function mm2px(mm, dpi = 96) {
  return mm / 25.4 * dpi
}

/**
 * 不同dpi下像素转换，默认300dpi的像素转化为96dpi的像素
 * @px {Integer} px 像素
 * @fromDpi {Integer} 默认300dpi
 * @toDpi {Integer} 默认96dpi
 */
function px2px(px, fromDpi = 300, toDpi = 96) {
  return px * toDpi / fromDpi
}

/**
 * 计算元素图形的关键点坐标，放到element.points属性
 * center top right bottom left tl tr bl br
 * @param {Object} element 要计算的元素图形
 */
function calcShapePoints(element) {
  if (!element.hasOwnProperty('points')) {
    element.points = {}
  }
  switch (element.shape) {
    case 'rect':
      element.points.top = [element.properties.x + element.properties.width / 2, element.properties.y]
      element.points.right = [element.properties.x + element.properties.width, element.properties.y + element.properties.height / 2]
      element.points.bottom = [element.properties.x + element.properties.width / 2, element.properties.y + element.properties.height]
      element.points.left = [element.properties.x, element.properties.y + element.properties.height / 2]
      element.points.center = [element.properties.x + element.properties.width / 2, element.properties.y + element.properties.height / 2]
      
      element.points.tl = [element.properties.x, element.properties.y]
      element.points.tr = [element.properties.x + element.properties.width, element.properties.y]
      element.points.bl = [element.properties.x, element.properties.y + element.properties.height]
      element.points.br = [element.properties.x + element.properties.width, element.properties.y + element.properties.height]
      break
    case 'circle':
      element.points.top = [element.properties.cx, element.properties.cy - element.properties.r]
      element.points.right = [element.properties.cx + element.properties.r, element.properties.cy]
      element.points.bottom = [element.properties.cx, element.properties.cy + element.properties.r]
      element.points.left = [element.properties.cx - element.properties.r, element.properties.cy]
      element.points.center = [element.properties.cx, element.properties.cy]
      
      element.points.tl = [element.properties.cx - element.properties.r, element.properties.cy - element.properties.r]
      element.points.tr = [element.properties.cx + element.properties.r, element.properties.cy - element.properties.r]
      element.points.bl = [element.properties.cx - element.properties.r, element.properties.cy + element.properties.r]
      element.points.br = [element.properties.cx + element.properties.r, element.properties.cy + element.properties.r]
      break
    default:
  }
}

function calcShapePointsAndPropertiesFromDragPoints(element){
  switch (element.shape) {
    case 'rect':
      element.properties.x = element.points.tl[0]
      element.properties.y = element.points.tl[1]
      element.properties.width = element.points.tr[0] - element.points.tl[0]
      element.properties.height = element.points.bl[1] - element.points.tl[1]
      
      element.points.top = [element.properties.x + element.properties.width / 2, element.properties.y]
      element.points.right = [element.properties.x + element.properties.width, element.properties.y + element.properties.height / 2]
      element.points.bottom = [element.properties.x + element.properties.width / 2, element.properties.y + element.properties.height]
      element.points.left = [element.properties.x, element.properties.y + element.properties.height / 2]
      element.points.center = [element.properties.x + element.properties.width / 2, element.properties.y + element.properties.height / 2]
      break
    case 'circle':
      element.properties.r = (element.points.tr[0] - element.points.tl[0]) / 2
      element.properties.cx = element.points.tl[0] + element.properties.r
      element.properties.cy = element.points.tl[1] + element.properties.r
      
      element.points.top = [element.properties.cx, element.properties.cy - element.properties.r]
      element.points.right = [element.properties.cx + element.properties.r, element.properties.cy]
      element.points.bottom = [element.properties.cx, element.properties.cy + element.properties.r]
      element.points.left = [element.properties.cx - element.properties.r, element.properties.cy]
      element.points.center = [element.properties.cx, element.properties.cy]
      break
    default:
  }
}

/**
 * 计算以一个坐标点为中心的正方形起始坐标
 * @param {Object} point 正放形中心点坐标
 * @param {Object} width 正放形边长
 */
function calcSquareFromCenterPoint(point, width){
  cl(point)
  return {
    x: point[0] - width / 2,
    y: point[1] - width / 2,
    width: width,
    height: width
  }
}

