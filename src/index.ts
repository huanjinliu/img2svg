import fillUnit from "./strategies/fill-unit"
import { createSvgElement } from "./utils/create-svg-elements"

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
  if (!ctx) return ''
  
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const svg = createSvgElement({
    width: canvas.width,
    height: canvas.height,
  })

  // 方案一：填充每一个单位色块
  fillUnit(svg, imageData)

  return svg
}

export default image2svg