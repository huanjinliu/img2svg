import { createRectElement } from "../utils/create-svg-elements"
import forEachImagePixel from "../utils/foreach-image-pixel"

/**
 * 填充每一个单位色块
 */
const fillUnit = (svg: SVGSVGElement, imageData: ImageData) => {
  // 遍历像素点并为每个像素创建矩形色块
  forEachImagePixel(imageData, (row, col, color) => {
    const { r, g, b, a } = color
    const opacity = a / 255
    // 如果透明度为0，则不可视，也没必要创建对应色块了
    if (opacity === 0) return
    svg.appendChild(createRectElement({
      x: col,
      y: row,
      width: 1,
      height: 1,
      fill: `rgb(${r}, ${g}, ${b})`,
      opacity,
    }))
  })
}

export default fillUnit