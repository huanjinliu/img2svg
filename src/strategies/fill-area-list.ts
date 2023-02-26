import { createPathElement, Point } from "../utils/create-svg-elements";
import { RGBA } from "../utils/get-pixel-rgba";
import forEachImagePixel from "../utils/foreach-image-pixel";
import isSameColor from "../utils/is-same-color";

type PathArea = {
  head: { row: number; col: number };
  outer: Point[];
  inners: Point[][];
  next?: PathArea
}

/**
 * 填充区域色块
 * ① 遍历像素点
 * ② 每个像素点判断上左两个方向的像素点是否同色，如果是则“融合”区域，如果都没有则创建起始点
 * ④ 遍历完成后生成路径标签并填充区域
 */
const fillArea = (svg: SVGSVGElement, imageData: ImageData) => {

  const pathPoints: {
    head: boolean;
    color: RGBA;
    area?: PathArea;
  }[][] = []

  forEachImagePixel(imageData, (row, col, color) => {
    if (!pathPoints[row]) pathPoints[row] = []

    if (color.a === 0) {
      pathPoints[row].push({ head: false, color })
      return;
    }

    const topPixel = pathPoints[row - 1]?.[col]
    const leftPixel = pathPoints[row]?.[col - 1]

    let topArea = topPixel?.area
    let leftArea = leftPixel?.area

    while (topArea?.next) {
      topArea = topArea.next
    }
    while (leftArea?.next) {
      leftArea = leftArea.next
    }

    const isSameColorWithTop =
      topArea !== undefined &&
      isSameColor(pathPoints[topArea.head.row][topArea.head.col].color, color)
    const isSameColorWithLeft =
      leftArea !== undefined &&
      isSameColor(pathPoints[leftArea.head.row][leftArea.head.col].color, color)

    // 创建起始区域
    if (!isSameColorWithTop && !isSameColorWithLeft) {
      pathPoints[row].push({
        head: true,
        color,
        area: {
          head: { row, col },
          outer: [
            { x: col, y: row },
            { x: col + 1, y: row },
            { x: col + 1, y: row + 1 },
            { x: col, y: row + 1 },
          ],
          inners: []
        }
      })

      return;
    }

    // 如果上方向像素点同色
    if (topArea && isSameColorWithTop) {
      const index = topArea.outer.findIndex(point =>
        point.x === col &&
        point.y === row
      )
      topArea.outer.splice(index, 0,
        { x: col + 1, y: row + 1 },
        { x: col, y: row + 1 },
      )
      pathPoints[row].push({
        head: false,
        color,
        area: topArea
      })
    }

    // 如果左方向像素点同色
    if (leftArea && isSameColorWithLeft) {
      // 如果上方向也同色
      if (isSameColorWithTop) {
        // 是否处在同个区域
        if (topArea === leftArea) {
          // 找到相接点
          let indexs: number[] = []
          for(let i = 0; i < topArea.outer.length; i++) {
            const item = topArea.outer[i]
            if (item.x === col && item.y === row) {
              indexs.push(i);
              if (indexs.length == 2) break;
            }
          }
          if (indexs.length === 1) {
            topArea.outer.splice(indexs[0] - 1, 2)
            return
          }
          const removePoints = topArea.outer.splice(indexs[0], indexs[1] - indexs[0] + 2)
          topArea.inners.push(
            removePoints.slice(0, -2)
          )
          return
        }
        // 如果不是同个区域则融合区域(统一左侧区域融合进上侧区域)
        if (topArea) {
          const topIndex = topArea.outer.findIndex(item => item.x === col && item.y === row)
          const leftIndex = leftArea.outer.findIndex(item => item.x === col && item.y === row)

          topArea.outer = topArea.outer
            .slice(0, topIndex)
            .concat(
              leftArea.outer.slice(leftIndex + 2),
              leftArea.outer.slice(0, leftIndex),
              topArea.outer.slice(topIndex)
            )
          topArea.inners = topArea.inners.concat(leftArea.inners)
          pathPoints[leftArea.head.row][leftArea.head.col].head = false
          leftArea.next = topArea
        }
        return;
      }
      let index = leftArea.outer.findIndex(point =>
        point.x === col &&
        point.y === row
      ) + 1

      // 如果右上角点已存在
      const rightTopPointIndex = leftArea.outer.findIndex(point =>
        point.x === col + 1 &&
        point.y === row
      )

      if (rightTopPointIndex !== -1) {
        // 皇冠型
        if (index < rightTopPointIndex) {
          // 组建内部区域
          const newOuterPoints = leftArea.outer.splice(index, rightTopPointIndex - index)
          leftArea.inners.push(leftArea.outer)
          pathPoints[leftArea.head.row][leftArea.head.col].head = false

          leftArea.outer = newOuterPoints
          leftArea.head = { row, col }

          index = leftArea.outer.length - 1
        } else {
          const removePoints = leftArea.outer.splice(rightTopPointIndex, index - rightTopPointIndex)
          leftArea.inners.push(removePoints)
          index = rightTopPointIndex
        }
      }

      leftArea.outer.splice(index, 0,
        { x: col + 1, y: row },
        { x: col + 1, y: row + 1 },
      )
      pathPoints[row].push({
        head: leftArea.head.row === row && leftArea.head.col === col,
        color,
        area: leftArea
      })
    }
  })

  // 遍历色值数组
  const { width, height } = imageData

  for(let row = 0; row < height; row++) {
    for(let col = 0; col < width; col++) {
      const pixel = pathPoints[row][col]
      if (!pixel.area || !pixel.head) continue

      const { color, area } = pixel

      svg.appendChild(createPathElement({
        path: area.outer,
        clipPaths: area.inners,
        fill: `rgb(${color.r}, ${color.g}, ${color.b})`,
        opacity: color.a / 255
      }))
    }
  }
}

export default fillArea
