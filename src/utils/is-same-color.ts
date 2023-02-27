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
  const { r: R1, g: G1, b: B1, a: A1 } = color1;
  const { r: R2, g: G2, b: B2, a: A2 } = color2;
  const { float = 0, ignoreOpacity = false } = options
  const similarity = 1 - (Math.sqrt(Math.pow(R2-R1,2) + Math.pow(G2-G1,2) + Math.pow(B2-B1,2)))/ (Math.sqrt(Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2)))

  return 1 - similarity <= float
}

export default isSameColor
