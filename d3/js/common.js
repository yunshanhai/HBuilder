/**
 * cl:consoel.log的函数缩写
 * @param {Object} message
 */
function cl(message) {
  console.log(message);
}

/**
 * '{0}{1}'.format('0', '1');
 * '{key0, key1}'.format({key0:'value0', key1:'value1'});
 * @param {Object} args
 */
String.prototype.format = function(args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof(args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    } else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
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
  cl(dpi);
  return mm / 25.4 * dpi
}

function px2px(px, fromDpi = 300, toDpi = 96) {
  return px * toDpi / fromDpi
}

!function (){
  var wuyun = {
    version: '1.0'
  };
  
  this.wuyun = wuyun;
}();
