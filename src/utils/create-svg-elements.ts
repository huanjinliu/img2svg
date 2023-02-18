
const SVG_NAMESPACE = "http://www.w3.org/2000/svg"

/**
 * 创建一个带矩形色块基本的svg
 * @param options 配置属性
 * @returns svg元素
 */
export const createSvgElement = (attrs: {
  width: number,
  height: number,
  viewBox?: string,
}) => {
  const { width, height, viewBox = `0 0 ${width} ${height}` } = attrs
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')

  svg.setAttribute('viewBox', viewBox)
  svg.setAttribute('width', `${width}`)
  svg.setAttribute('height', `${height}`)

  return svg
}

/**
 * 创建一个矩形色块
 * @param options 配置属性
 * @returns 矩形色块
 */
export const createRectElement = (attrs: {
  x?: number,
  y?: number,
  width: number,
  height: number,
  fill?: string,
  opacity?: number,
}) => {
  const { x = 0, y = 0, width, height, fill = '#000', opacity = 1 } = attrs
  const rect = document.createElementNS(SVG_NAMESPACE, 'rect')
  rect.setAttribute('x', `${x}`)
  rect.setAttribute('y', `${y}`)
  rect.setAttribute('width', `${width}`)
  rect.setAttribute('height', `${height}`)
  rect.setAttribute('fill', fill)
  rect.setAttribute('fill-opacity', `${opacity}`)

  return rect
}