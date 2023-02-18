
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    /**
     * 将图像转化为svg图像
     * @param image 图像节点
     * @returns
     */
    var image2svg = function image2svg(image) {
      var canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      var ctx = canvas.getContext('2d');
      ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(image, 0, 0);
      return canvas.toDataURL('png');
    };

    const main = () => {
        const sourceImage = document.querySelector('#source');
        const effectImage = document.querySelector('#effect');
        effectImage.src = image2svg(sourceImage);
    };
    main();

})();
