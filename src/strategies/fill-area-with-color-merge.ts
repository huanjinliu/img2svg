import { createPathElement, Point } from "../utils/create-svg-elements";
import { RGBA } from "../utils/get-pixel-rgba";
import forEachImagePixel from "../utils/foreach-image-pixel";
import isSameColor from "../utils/is-same-color";

/**
 * 色块区域
 */
type ColorArea = {
  /** 起始点坐标 */
  startPos: { row: number; col: number };
  /** 区域外边路径点列表 */
  outer: Point[];
  /** 镂空区域路径点列表 */
  inners: Point[][];
  /** 被融合进的区域 */
  within?: ColorArea
}

/**
 * 像素点
 */
type Pixel = {
  /** 颜色 */
  color: RGBA;
  /** 所在的色块区域引用 */
  area?: ColorArea;
}

/**
 * 获取像素点最终所在色块区域
 * @param area 直属区域
 * @returns 最终的区域归属
 */
const getPixelBelongArea = (area?: ColorArea) => {
  let _area = area;
  // 如果区域被融合进其他区域
  while (_area?.within) _area = _area.within

  return _area
}

/**
 * 填充区域颜色
 * ① 遍历像素点
 * ② 每个像素点判断上左两个方向的像素点是否同色，如果是则“融合”区域，如果都没有则创建起始点
 * ④ 遍历完成后生成路径标签并填充区域
 */
const fillArea = (svg: SVGSVGElement, imageData: ImageData) => {

  // 像素点数据
  const pixelData: Pixel[][] = []
  
  // 从左到右、从上到下遍历像素
  forEachImagePixel(imageData, (row, col, color) => {
    if (!pixelData[row]) pixelData[row] = []

    // 完全透明的像素块，没有渲染成路径的必要
    if (color.a === 0) {
      pixelData[row].push({ color })
      return;
    }

    // 上边像素点
    const topPixel = pixelData[row - 1]?.[col]
    // 左边像素点
    const leftPixel = pixelData[row]?.[col - 1]

    // 上边像素所在区域
    const topArea = getPixelBelongArea(topPixel?.area)
    // 左边像素所在区域
    const leftArea = getPixelBelongArea(leftPixel?.area)

    // 是否与上边区域颜色一样
    const sameWithTop = topArea && isSameColor(topPixel.color, color)
    // 是否与左边区域颜色一样
    const sameWithLeft = leftArea && isSameColor(leftPixel.color, color)

    // 根据不同情况执行不同的融合操作
    const mergeHandles = {
      sameNone: () => {
        pixelData[row].push({
          color,
          area: {
            startPos: { row, col },
            outer: [
              { x: col, y: row },
              { x: col + 1, y: row },
              { x: col + 1, y: row + 1 },
              { x: col, y: row + 1 },
            ],
            inners: []
          }
        })
      },
      sameWithTopOnly: () => {
        if (!topArea) return
        const index = topArea.outer.findIndex(point =>
          point.x === col &&
          point.y === row
        )
        topArea.outer.splice(index, 0,
          { x: col + 1, y: row + 1 },
          { x: col, y: row + 1 },
        )
        pixelData[row].push({
          color,
          area: topArea
        })
      },
      sameWithLeftOnly: () => {
        if (!leftArea) return
        let index = leftArea.outer.findIndex(point =>
          point.x === col &&
          point.y === row
        )
        leftArea.outer.splice(index + 1, 0,
          { x: col + 1, y: row },
          { x: col + 1, y: row + 1 },
        )
        pixelData[row].push({
          color,
          area: leftArea
        })
      },
      sameBothAndSameArea: () => {
        if (!topArea) return
        const index = topArea.outer.findIndex(point => point.x === col && point.y === row)

        topArea.outer.splice(index, 1, { x: col + 1, y: row + 1 })

        pixelData[row].push({
          color,
          area: topArea
        })
      },
      sameBothAndDiffArea: () => {
        if (!leftArea || !topArea) return
        const topIndex = topArea.outer.findIndex(item => item.x === col && item.y === row)
        const leftIndex = leftArea.outer.findIndex(item => item.x === col && item.y === row)

        topArea.outer = topArea.outer
          .slice(0, topIndex)
          .concat(
            [{ x: col + 1, y: row + 1 }],
            leftArea.outer.slice(leftIndex + 1),
            leftArea.outer.slice(0, leftIndex + 1),
            topArea.outer.slice(topIndex + 1),
          )
        topArea.inners = topArea.inners.concat(leftArea.inners)
        leftArea.within = topArea
        pixelData[row].push({
          color,
          area: topArea
        })
      },
      hollowArea: (leftIndex: number, rightTopIndex: number) => {
        if (!leftArea) return
        const removePoints = leftArea.outer.splice(rightTopIndex, (leftIndex + 1) - rightTopIndex)
        leftArea.inners.push(removePoints)
        leftArea.outer.splice(rightTopIndex, 0,
          { x: col + 1, y: row },
          { x: col + 1, y: row + 1 },
        )
        pixelData[row].push({
          color,
          area: leftArea
        })
      },
      hollowAreaWithNewStart: (leftIndex: number, rightTopIndex: number) => {
        if (!leftArea) return
        const newOuterPoints = leftArea.outer.splice(leftIndex + 1, rightTopIndex - (leftIndex + 1))
        leftArea.inners.push(leftArea.outer)

        leftArea.outer = newOuterPoints
        leftArea.startPos = { row, col }

        leftArea.outer.push(
          { x: col + 1, y: row },
          { x: col + 1, y: row + 1 },
        )
        pixelData[row].push({
          color,
          area: leftArea
        })
      },
    }

    if (sameWithLeft) {
      if (sameWithTop) {
        if (topArea === leftArea) mergeHandles.sameBothAndSameArea()
        else mergeHandles.sameBothAndDiffArea()
      } else {
        let index = leftArea.outer.findIndex(point =>
          point.x === col &&
          point.y === row
        )
        const rightTopIndex = leftArea.outer.findIndex(point =>
          point.x === col + 1 &&
          point.y === row
        )
        if (rightTopIndex !== -1) {
          if (index > rightTopIndex) mergeHandles.hollowArea(index, rightTopIndex)
          else mergeHandles.hollowAreaWithNewStart(index, rightTopIndex)
        } else mergeHandles.sameWithLeftOnly()
      }
    } else if (sameWithTop) mergeHandles.sameWithTopOnly()
    else mergeHandles.sameNone()
  })

  // 遍历色值数组
  const { width, height } = imageData

  for(let row = 0; row < height; row++) {
    for(let col = 0; col < width; col++) {
      const pixel = pixelData[row][col]

      const area = getPixelBelongArea(pixel.area)
      // 没有绘制区域，跳出
      if (!area) continue

      const { color } = pixel
      const { startPos, outer, inners } = area
      // 不是区域绘制起始点，跳出
      if (startPos.row !== row || startPos.col !== col) continue

      svg.appendChild(createPathElement({
        path: outer,
        clipPaths: inners,
        fill: `rgb(${color.r}, ${color.g}, ${color.b})`,
        opacity: color.a / 255
      }))
    }
  }
}

export default fillArea
