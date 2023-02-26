import fillAreaArray from "./strategies/fill-area-array"
import fillAreaList from "./strategies/fill-area-list"
import fillUnit from "./strategies/fill-unit"
import { createSvgElement } from "./utils/create-svg-elements"

/**
 * 构建测试图像
 */
const createTestImage = (
  canvas: HTMLCanvasElement,
  row: number,
  col: number,
  specialFill: {
    row: number;
    col: number;
    color: string;
  }[] = []
) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = col
  canvas.height = row

  for(let i = 0; i < row; i++) {
    for(let j = 0; j < col; j++) {
      const fill = specialFill.find(item => item.col === j && item.row === i)
      ctx.fillStyle = fill?.color ?? 'red'
      ctx.fillRect(j, i, 1, 1)
    }
  }
}

/**
 * 将图像转化为svg
 * @param image 图像节点
 * @returns
 */
const image2svg = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

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

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  // console.log(imageData)

  const svg = createSvgElement({
    width: canvas.width,
    height: canvas.height,
  })

  // 方案一：填充每一个单位色块
  // fillUnit(svg, imageData)

  // 方案二：填充区域色块
  fillAreaArray(svg, imageData)

  return { canvas, svg }
}

export default image2svg
