import fillAreaWithColorMerge from "./strategies/fill-area-with-color-merge"
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

  // createTestImage(canvas, 5, 5, [
  //   {
  //     row: 0,
  //     col: 0,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 1,
  //     col: 1,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 2,
  //     col: 2,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 3,
  //     col: 3,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 0,
  //     col: 3,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 1,
  //     col: 4,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 3,
  //     col: 0,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 4,
  //     col: 1,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 4,
  //     col: 0,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  //   {
  //     row: 0,
  //     col: 4,
  //     color: 'rgba(255, 0, 0, 0)'
  //   },
  // ])

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  // console.log(imageData)

  const svg = createSvgElement({
    width: canvas.width,
    height: canvas.height,
  })

  // 寻找区域色块
  fillAreaWithColorMerge(svg, imageData)

  return { canvas, svg }
}

export default image2svg
