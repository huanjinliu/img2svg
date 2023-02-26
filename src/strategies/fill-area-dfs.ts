import { createPathElement, createRectElement, Point, SVG_NAMESPACE } from "../utils/create-svg-elements";
import forEachImagePixel from "../utils/foreach-image-pixel"
import { RGBA } from "../utils/get-pixel-rgba";
import isSameColor from "../utils/is-same-color";

// 像素点
type Pixel = {
  color: RGBA,
  row: number,
  col: number,
  finding: boolean,
  found: boolean,
  inner: boolean,
  ending: boolean,
  left?: Pixel
  top?: Pixel
  right?: Pixel
  bottom?: Pixel
}

/**
 * 填充区域色块
 */
const fillArea = (svg: SVGSVGElement, imageData: ImageData) => {
  const { width, height } = imageData
  // 像素块对应色值二维数组
  const pixelColorArray: (Pixel | undefined)[][] = []

  /**
   * 遍历像素点并转化为二位数组，便于后续广搜查找
   * 同时减少内部getPixelRGBA的使用，毕竟每次都会返回全新对象
   */
  forEachImagePixel(imageData, (row, col, color) => {
    if (!pixelColorArray[row]) pixelColorArray[row] = []

    // 当色值透明时不加入列表，减少色值对象创建，节省内存
    if (color.a === 0) return

    pixelColorArray[row][col] = {
      color,
      row,
      col,
      inner: false,
      finding: false,
      found: false,
      ending: true,
    }
  })

  /**
   * 寻找区域形成的路径
   */
  const findAreaPath = (row: number, col: number) => {
    const startPixel = pixelColorArray[row]?.[col]

    if (!startPixel || startPixel.found) return

    const pixels: Pixel[] = []

    /**
     * 寻找同色值像素块
     */
    const findSamePixel = (row: number, col: number, preRow = -1, preCol = -1) => {
      const pixel = pixelColorArray[row]?.[col]
  
      // 如果触达边界
      if (!pixel) return
  
      // 该目标像素块正处于寻找同色块状态
      if (pixel.finding) return pixel
  
      // 上一个像素点
      const prePixel = pixelColorArray[preRow]?.[preCol]
  
      // 如果和上一个遍历的像素色值不同，则跳出
      if (prePixel && !isSameColor(pixel.color, prePixel.color)) return

      // 如果自身经过色块匹配
      if (pixel.found) return null
  
      // 四个方向找同色值像素，如其中一个方向不同色值或超出图像边界都是边缘像素
      const find = (nextRow: number, nextCol: number) => {
        const samePixel = nextRow === preRow && nextCol === preCol
          ? prePixel
          : findSamePixel(nextRow, nextCol, row, col)
  
        if (samePixel) {
          let dir: 'top' | 'bottom' | 'left' | 'right' = 'top';
          if (row < nextRow) dir = 'bottom'
          if (col > nextCol) dir = 'left'
          if (col < nextCol) dir = 'right'
          pixel[dir] = samePixel
          samePixel[{
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left',
          }[dir]] = pixel
        }

        return samePixel
      }
      
      pixel.finding = true

      pixels.push(pixel)
  
      const top = find(row - 1, col)
      const left = find(row, col + 1)
      const bottom = find(row + 1, col)
      const right = find(row, col - 1)

      pixel.finding = false
      pixel.found = true
  
      // 所有方向都有同色块，则是区域内像素
      pixel.inner = Boolean(top && left && bottom && right)

      // 是否是深搜终点
      pixel.ending = [top, left, bottom, right].every((dir) => {
        return !dir || dir === prePixel || dir.finding
      })

      return pixel
    }

    findSamePixel(row, col)

    /**
     * 合并像素区域
     * @param point 
     */
    const mergePixelArea = () => {
      const outer: Point[] = []
      const inners: Point[][] = []

      pixels.forEach((pixel, index, arr) => {
        const { left, top, right, bottom, col, row } = pixel

        if (outer.length === 0) {
          outer.push(...[
            { x: col, y: row },
            { x: col + 1, y: row },
            { x: col + 1, y: row + 1 },
            { x: col, y: row + 1 },
          ])
          return
        }

        const prePixel = [top, right, bottom, left].find(item => item && arr.indexOf(item) < index);
        if (!prePixel) return

        if (pixel.top === prePixel) {
          outer.splice(outer.findIndex(point =>
            point.x === prePixel.col &&
            point.y === prePixel.row + 1
          ), 0, ...[
            { x: col + 1, y: row + 1 },
            { x: col, y: row + 1 },
          ])
        }

        if (pixel.left === prePixel) {
          outer.splice(outer.findIndex(point =>
            point.x === prePixel.col + 1 &&
            point.y === prePixel.row + 1
          ), 0, ...[
            { x: col + 1, y: row },
            { x: col + 1, y: row + 1 },
          ])
        }

        if (pixel.bottom === prePixel) {
          outer.splice(outer.findIndex(point =>
            point.x === prePixel.col + 1 &&
            point.y === prePixel.row
          ), 0, ...[
            { x: col, y: row },
            { x: col + 1, y: row },
          ])
        }

        if (pixel.right === prePixel) {
          outer.splice(outer.findIndex(point =>
            point.x === prePixel.col &&
            point.y === prePixel.row
          ), 0, ...[
            { x: col, y: row + 1 },
            { x: col, y: row },
          ])
        }
      })

      return { outer, inners }
    }

    return mergePixelArea();
  }

  // 遍历色值数组
  for(let row = 0; row < height; row++) {
    for(let col = 0; col < width; col++) {
      const pixel = pixelColorArray[row][col]
      // 如果为透明像素，直接跳出
      if (!pixel) continue
      
      /**
       * 因为非边缘点肯定在同区域块边缘点被遍历后再被遍历到，
       * 但是边缘点在寻找整条链的过程就会把所有非边缘点都遍历完，
       * 所以能到这一步的必然自身就是边缘像素点
       */
      const areaPath = findAreaPath(row, col)
      if (!areaPath) continue

      const { outer } = areaPath
      const { color } = pixel

      // console.log(outer)
      svg.appendChild(createPathElement({
        path: outer,
        fill: `rgb(${color.r}, ${color.g}, ${color.b})`,
        opacity: color.a / 255
      }))
    }
  }

  // for(let row = 0; row < height; row++) {
  //   for(let col = 0; col < width; col++) {
  //     const pixel = pixelColorArray[row][col]
      
  //     if (pixel) {
  //       const { color } = pixel
  //       svg.appendChild(createRectElement({
  //         x: col,
  //         y: row,
  //         width: 1,
  //         height: 1,
  //         fill: `rgb(${color.r}, ${color.g}, ${color.b})`,
  //       }))
  //     }
  //   }
  // }

  // const path = document.createElementNS(SVG_NAMESPACE, 'path')
  // path.setAttribute(
  //   'd',
  //   `
  //     M1,1 L5,1 L5,5 L1,5
  //     M2,2 L2,3 L3,3 L3,2
  //     M4,4 L5,4 L5,5 L4,5
  //   `
  // )
  // path.setAttribute('fill', 'blue')
  // path.setAttribute('fill-rule', 'evenodd')

  // svg.appendChild(path)

  // console.log(pixelColorArray)
  // const opacity = color.a / 255
  // // 如果透明度为0，则不可视，也没必要创建对应色块了
  // if (opacity === 0) return

  return pixelColorArray
}

export default fillArea