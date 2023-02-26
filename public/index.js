
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
  'use strict';

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  /**
   * 创建一个带矩形色块基本的svg
   * @param attrs 配置属性
   * @returns svg元素
   */
  var createSvgElement = function createSvgElement(attrs) {
    var width = attrs.width,
      height = attrs.height,
      _attrs$viewBox = attrs.viewBox,
      viewBox = _attrs$viewBox === void 0 ? "0 0 ".concat(width, " ").concat(height) : _attrs$viewBox;
    var svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('width', "".concat(width));
    svg.setAttribute('height', "".concat(height));
    return svg;
  };
  /**
   * 创建一个填充色块路径区域
   * @param attrs 配置属性
   * @returns 路径区域
   */
  var createPathElement = function createPathElement(attrs) {
    var path = attrs.path,
      _attrs$clipPaths = attrs.clipPaths,
      clipPaths = _attrs$clipPaths === void 0 ? [] : _attrs$clipPaths,
      _attrs$fill = attrs.fill,
      fill = _attrs$fill === void 0 ? '#000' : _attrs$fill,
      _attrs$opacity = attrs.opacity,
      opacity = _attrs$opacity === void 0 ? 1 : _attrs$opacity;
    var pathElement = document.createElementNS(SVG_NAMESPACE, 'path');
    // 创建路径点
    var createPath = function createPath(points) {
      return points.reduce(function (result, point, index, arr) {
        if (index === 0) return "M".concat(point.x, ",").concat(point.y);
        var prePoint = arr[index - 1];
        var nextPoint = arr[index + 1];
        // 如果点居于中间则无需添加
        if (prePoint && nextPoint) {
          if (point.x === prePoint.x && point.x === nextPoint.x && (point.y > prePoint.y && point.y < nextPoint.y || point.y < prePoint.y && point.y > nextPoint.y)) return result;
          if (point.y === prePoint.y && point.y === nextPoint.y && (point.x > prePoint.x && point.x < nextPoint.x || point.x < prePoint.x && point.x > nextPoint.x)) return result;
        }
        return result + " L".concat(point.x, ",").concat(point.y);
      }, '');
    };
    // 创建合并路径点
    var d = [path].concat(_toConsumableArray(clipPaths)).reduce(function (d, points, index) {
      var _d = createPath(points);
      return index === 0 ? _d : "".concat(d, " ").concat(_d);
    }, '');
    pathElement.setAttribute('d', d);
    pathElement.setAttribute('fill', fill);
    pathElement.setAttribute('fill-opacity', "".concat(opacity));
    pathElement.setAttribute('fill-rule', 'evenodd');
    return pathElement;
  };

  /**
   * 获取图像某个位置像素的色彩值
   * @param imageData 图像像素数据
   * @param row 像素点所在行
   * @param col 像素点所在列
   * @returns 像素点色值(RGBA)
   */
  var getPixelRGBA = function getPixelRGBA(imageData, row, col) {
    var data = imageData.data,
      width = imageData.width;
    var index = row * width * 4 + col * 4;
    if (index < 0) return;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      // 这里为了保证透明度数值准确度，不转化为[0, 1]范围
      a: data[index + 3]
    };
  };

  /**
   * 遍历图像像素点
   * @param imageData 图像像素数据
   * @param handler 遍历处理方法
   */
  var forEachImagePixel = function forEachImagePixel(imageData, handler) {
    var width = imageData.width,
      height = imageData.height;
    for (var row = 0; row < height; row++) {
      for (var col = 0; col < width; col++) {
        handler(row, col, getPixelRGBA(imageData, row, col));
      }
    }
  };

  /**
   * 两个色值是否相同
   */
  var isSameColor = function isSameColor(color1, color2) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$float = options["float"],
      _float = _options$float === void 0 ? 0 : _options$float,
      _options$ignoreOpacit = options.ignoreOpacity,
      ignoreOpacity = _options$ignoreOpacit === void 0 ? false : _options$ignoreOpacit;
    return Math.abs(color1.r - color2.r) <= _float && Math.abs(color1.g - color2.g) <= _float && Math.abs(color1.b - color2.b) <= _float && (ignoreOpacity || Math.abs(color1.a - color2.a) <= _float);
  };

  /**
   * 获取像素点最终所在色块区域
   * @param area 直属区域
   * @returns 最终的区域归属
   */
  var getPixelBelongArea = function getPixelBelongArea(area) {
    var _area = area;
    // 如果区域被融合进其他区域
    while (_area === null || _area === void 0 ? void 0 : _area.within) _area = _area.within;
    return _area;
  };
  /**
   * 填充区域颜色
   * ① 遍历像素点
   * ② 每个像素点判断上左两个方向的像素点是否同色，如果是则“融合”区域，如果都没有则创建起始点
   * ④ 遍历完成后生成路径标签并填充区域
   */
  var fillArea = function fillArea(svg, imageData) {
    // 像素点数据
    var pixelData = [];
    // 从左到右、从上到下遍历像素
    forEachImagePixel(imageData, function (row, col, color) {
      var _a, _b;
      if (!pixelData[row]) pixelData[row] = [];
      // 完全透明的像素块，没有渲染成路径的必要
      if (color.a === 0) {
        pixelData[row].push({
          color: color
        });
        return;
      }
      // 上边像素点
      var topPixel = (_a = pixelData[row - 1]) === null || _a === void 0 ? void 0 : _a[col];
      // 左边像素点
      var leftPixel = (_b = pixelData[row]) === null || _b === void 0 ? void 0 : _b[col - 1];
      // 上边像素所在区域
      var topArea = getPixelBelongArea(topPixel === null || topPixel === void 0 ? void 0 : topPixel.area);
      // 左边像素所在区域
      var leftArea = getPixelBelongArea(leftPixel === null || leftPixel === void 0 ? void 0 : leftPixel.area);
      // 是否与上边区域颜色一样
      var sameWithTop = topArea && isSameColor(topPixel.color, color);
      // 是否与左边区域颜色一样
      var sameWithLeft = leftArea && isSameColor(leftPixel.color, color);
      // 根据不同情况执行不同的融合操作
      var mergeHandles = {
        sameNone: function sameNone() {
          pixelData[row].push({
            color: color,
            area: {
              startPos: {
                row: row,
                col: col
              },
              outer: [{
                x: col,
                y: row
              }, {
                x: col + 1,
                y: row
              }, {
                x: col + 1,
                y: row + 1
              }, {
                x: col,
                y: row + 1
              }],
              inners: []
            }
          });
        },
        sameWithTopOnly: function sameWithTopOnly() {
          if (!topArea) return;
          var index = topArea.outer.findIndex(function (point) {
            return point.x === col && point.y === row;
          });
          topArea.outer.splice(index, 0, {
            x: col + 1,
            y: row + 1
          }, {
            x: col,
            y: row + 1
          });
          pixelData[row].push({
            color: color,
            area: topArea
          });
        },
        sameWithLeftOnly: function sameWithLeftOnly() {
          if (!leftArea) return;
          var index = leftArea.outer.findIndex(function (point) {
            return point.x === col && point.y === row;
          });
          leftArea.outer.splice(index + 1, 0, {
            x: col + 1,
            y: row
          }, {
            x: col + 1,
            y: row + 1
          });
          pixelData[row].push({
            color: color,
            area: leftArea
          });
        },
        sameBothAndSameArea: function sameBothAndSameArea() {
          if (!topArea) return;
          var index = topArea.outer.findIndex(function (point) {
            return point.x === col && point.y === row;
          });
          topArea.outer.splice(index, 1, {
            x: col + 1,
            y: row + 1
          });
          pixelData[row].push({
            color: color,
            area: topArea
          });
        },
        sameBothAndDiffArea: function sameBothAndDiffArea() {
          if (!leftArea || !topArea) return;
          var topIndex = topArea.outer.findIndex(function (item) {
            return item.x === col && item.y === row;
          });
          var leftIndex = leftArea.outer.findIndex(function (item) {
            return item.x === col && item.y === row;
          });
          topArea.outer = topArea.outer.slice(0, topIndex).concat([{
            x: col + 1,
            y: row + 1
          }], leftArea.outer.slice(leftIndex + 1), leftArea.outer.slice(0, leftIndex + 1), topArea.outer.slice(topIndex + 1));
          topArea.inners = topArea.inners.concat(leftArea.inners);
          leftArea.within = topArea;
          pixelData[row].push({
            color: color,
            area: topArea
          });
        },
        hollowArea: function hollowArea(leftIndex, rightTopIndex) {
          if (!leftArea) return;
          var removePoints = leftArea.outer.splice(rightTopIndex, leftIndex + 1 - rightTopIndex);
          leftArea.inners.push(removePoints);
          leftArea.outer.splice(rightTopIndex, 0, {
            x: col + 1,
            y: row
          }, {
            x: col + 1,
            y: row + 1
          });
          pixelData[row].push({
            color: color,
            area: leftArea
          });
        },
        hollowAreaWithNewStart: function hollowAreaWithNewStart(leftIndex, rightTopIndex) {
          if (!leftArea) return;
          var newOuterPoints = leftArea.outer.splice(leftIndex + 1, rightTopIndex - (leftIndex + 1));
          leftArea.inners.push(leftArea.outer);
          leftArea.outer = newOuterPoints;
          leftArea.startPos = {
            row: row,
            col: col
          };
          leftArea.outer.push({
            x: col + 1,
            y: row
          }, {
            x: col + 1,
            y: row + 1
          });
          pixelData[row].push({
            color: color,
            area: leftArea
          });
        }
      };
      if (sameWithLeft) {
        if (sameWithTop) {
          if (topArea === leftArea) mergeHandles.sameBothAndSameArea();else mergeHandles.sameBothAndDiffArea();
        } else {
          var index = leftArea.outer.findIndex(function (point) {
            return point.x === col && point.y === row;
          });
          var rightTopIndex = leftArea.outer.findIndex(function (point) {
            return point.x === col + 1 && point.y === row;
          });
          if (rightTopIndex !== -1) {
            if (index > rightTopIndex) mergeHandles.hollowArea(index, rightTopIndex);else mergeHandles.hollowAreaWithNewStart(index, rightTopIndex);
          } else mergeHandles.sameWithLeftOnly();
        }
      } else if (sameWithTop) mergeHandles.sameWithTopOnly();else mergeHandles.sameNone();
    });
    // 遍历色值数组
    var width = imageData.width,
      height = imageData.height;
    for (var row = 0; row < height; row++) {
      for (var col = 0; col < width; col++) {
        var pixel = pixelData[row][col];
        var area = getPixelBelongArea(pixel.area);
        // 没有绘制区域，跳出
        if (!area) continue;
        var color = pixel.color;
        var startPos = area.startPos,
          outer = area.outer,
          inners = area.inners;
        // 不是区域绘制起始点，跳出
        if (startPos.row !== row || startPos.col !== col) continue;
        svg.appendChild(createPathElement({
          path: outer,
          clipPaths: inners,
          fill: "rgb(".concat(color.r, ", ").concat(color.g, ", ").concat(color.b, ")"),
          opacity: color.a / 255
        }));
      }
    }
  };

  /**
   * 将图像转化为svg
   * @param image 图像节点
   * @returns
   */
  var image2svg = function image2svg(image) {
    var canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    // createTestImage(canvas, 3, 3, [
    //   {
    //     row: 0,
    //     col: 0,
    //     color: 'rgba(255, 0, 0, .5)'
    //   },
    //   {
    //     row: 1,
    //     col: 1,
    //     color: 'rgba(255, 0, 0, .5)'
    //   },
    //   // {
    //   //   row: 1,
    //   //   col: 2,
    //   //   color: 'rgba(255, 0, 0, .5)'
    //   // },
    //   // {
    //   //   row: 1,
    //   //   col: 3,
    //   //   color: 'rgba(255, 0, 0, .5)'
    //   // },
    //   // {
    //   //   row: 2,
    //   //   col: 1,
    //   //   color: 'rgba(255, 0, 0, .5)'
    //   // },
    //   // {
    //   //   row: 2,
    //   //   col: 3,
    //   //   color: 'rgba(255, 0, 0, .5)'
    //   // }
    // ])
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // console.log(imageData)
    var svg = createSvgElement({
      width: canvas.width,
      height: canvas.height
    });
    // 方案一：填充每一个单位色块
    // fillUnit(svg, imageData)
    // 方案二：填充区域色块
    fillArea(svg, imageData);
    return {
      canvas: canvas,
      svg: svg
    };
  };

  const main = () => {
      const sourceImage = document.querySelector('#source');
      const effect = document.querySelector('#effect');
      // sourceImage.onload = () => {
      const result = image2svg(sourceImage);
      if (result) {
          const { canvas, svg } = result;
          // sourceImage.src = canvas.toDataURL()
          effect.appendChild(svg);
      }
      // }
  };
  main();

})();
//# sourceMappingURL=index.js.map
