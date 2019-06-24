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
