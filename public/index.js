
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    /**
     * 创建一个带矩形色块基本的svg
     * @param options 配置属性
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
     * 创建一个矩形色块
     * @param options 配置属性
     * @returns 矩形色块
     */
    var createRectElement = function createRectElement(attrs) {
      var _attrs$x = attrs.x,
        x = _attrs$x === void 0 ? 0 : _attrs$x,
        _attrs$y = attrs.y,
        y = _attrs$y === void 0 ? 0 : _attrs$y,
        width = attrs.width,
        height = attrs.height,
        _attrs$fill = attrs.fill,
        fill = _attrs$fill === void 0 ? '#000' : _attrs$fill,
        _attrs$opacity = attrs.opacity,
        opacity = _attrs$opacity === void 0 ? 1 : _attrs$opacity;
      var rect = document.createElementNS(SVG_NAMESPACE, 'rect');
      rect.setAttribute('x', "".concat(x));
      rect.setAttribute('y', "".concat(y));
      rect.setAttribute('width', "".concat(width));
      rect.setAttribute('height', "".concat(height));
      rect.setAttribute('fill', fill);
      rect.setAttribute('fill-opacity', "".concat(opacity));
      return rect;
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
     * 填充每一个单位色块
     */
    var fillUnit = function fillUnit(svg, imageData) {
      // 遍历像素点并为每个像素创建矩形色块
      forEachImagePixel(imageData, function (row, col, color) {
        var r = color.r,
          g = color.g,
          b = color.b,
          a = color.a;
        var opacity = a / 255;
        // 如果透明度为0，则不可视，也没必要创建对应色块了
        if (opacity === 0) return;
        svg.appendChild(createRectElement({
          x: col,
          y: row,
          width: 1,
          height: 1,
          fill: "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")"),
          opacity: opacity
        }));
      });
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
      if (!ctx) return '';
      ctx.drawImage(image, 0, 0);
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var svg = createSvgElement({
        width: canvas.width,
        height: canvas.height
      });
      // 方案一：填充每一个单位色块
      fillUnit(svg, imageData);
      return svg;
    };

    const main = () => {
        const sourceImage = document.querySelector('#source');
        const effect = document.querySelector('#effect');
        const svg = image2svg(sourceImage);
        if (svg)
            effect.appendChild(svg);
    };
    main();

})();
