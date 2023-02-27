
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg"

export type Point = {
  x: number;
  y: number;
}

/**
 * 创建一个带矩形色块基本的svg
 * @param attrs 配置属性
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
 * @param attrs 配置属性
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

/**
 * 创建一个填充色块路径区域
 * @param attrs 配置属性
 * @returns 路径区域
 */
export const createPathElement = (attrs: {
  path: Point[],
  clipPaths?: Point[][],
  fill?: string,
  opacity?: number,
}) => {
  const { path: originPath, clipPaths = [], fill = '#000', opacity = 1 } = attrs;
  const pathElement = document.createElementNS(SVG_NAMESPACE, 'path')
  const dump = 2;

  // const calcAngleBetweenPoints = (point: Point, origin?: Point) => {
  //   if (!origin) return 0;

  //   const d = {
  //     x: point.x - origin.x,
  //     y: point.y - origin.y
  //   }

  //   return Math.atan2(d.y, d.x) / (Math.PI / 180);
  // }

  // const path: (Point & { angles: number[] })[] = []

  // Array.from({ length: dump }).forEach((_, step) => {
  //   originPath.forEach((point, index, arr) => {
  //     if (!path[index]) path[index] = { angles: [], ...point }

  //     const originStep = step + 1
  //     const originPoint = arr[index >= originStep ? index - originStep : arr.length + (index - originStep)]
  //     path[index].angles.push(calcAngleBetweenPoints(point, originPoint))
  //   })
  // })
  // console.log(path)

  // 创建路径点
  const createPath = (points: Point[]) => points.reduce<string>((result, point, index, arr) => {
    if (index === 0) return `M${point.x},${point.y}`

    const prePoint = arr[index - 1]
    const nextPoint = arr[index + 1]
    // 如果点居于中间则无需添加
    if (prePoint && nextPoint) {
      if (
        point.x === prePoint.x &&
        point.x === nextPoint.x &&
        ((point.y > prePoint.y && point.y < nextPoint.y) ||( point.y < prePoint.y && point.y > nextPoint.y))
      )
        return result

      if (
        point.y === prePoint.y &&
        point.y === nextPoint.y &&
        ((point.x > prePoint.x && point.x < nextPoint.x) || (point.x < prePoint.x && point.x > nextPoint.x))
      )
        return result
    }

    return result + ` L${point.x},${point.y}`
  }, '')

  // 创建合并路径点
  const d = [originPath, ...clipPaths].reduce<string>((d, points, index) => {
    const _d = createPath(points)

    return index === 0 ? _d : `${d} ${_d}`
  }, '')

  pathElement.setAttribute('d', d)
  pathElement.setAttribute('fill', fill)
  pathElement.setAttribute('fill-opacity', `${opacity}`)
  pathElement.setAttribute('fill-rule', 'evenodd')
  // pathElement.setAttribute('stroke', 'red')

  return pathElement
}