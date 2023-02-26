import { RGBA } from "./get-pixel-rgba"

/**
 * 两个色值是否相同
 */
const isSameColor = (color1: RGBA, color2: RGBA, options: Partial<{
  // 浮动值
  float: number;
  // 忽略透明度
  ignoreOpacity: boolean;
}> = {}) => {
  const { float = 0, ignoreOpacity = false } = options
  return (
    Math.abs(color1.r - color2.r) <= float &&
    Math.abs(color1.g - color2.g) <= float &&
    Math.abs(color1.b - color2.b) <= float &&
    (ignoreOpacity || Math.abs(color1.a - color2.a) <= float)
  )
}

export default isSameColor
