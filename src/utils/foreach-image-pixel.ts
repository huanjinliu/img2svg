import getPixelRGBA, { RGBA } from "./get-pixel-rgba";

/**
 * 遍历图像像素点
 * @param imageData 图像像素数据
 * @param handler 遍历处理方法
 */
const forEachImagePixel = (
  imageData: ImageData,
  handler: (
    row: number,
    col: number,
    color: RGBA
  ) => void,
) => {
  const { width, height } = imageData
  for(let row = 0; row < height; row++) {
    for(let col = 0; col < width; col++) {
      handler(row, col, getPixelRGBA(imageData, row, col)!)
    }
  }
}

export default forEachImagePixel