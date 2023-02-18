/**
 * 获取图像某个位置像素的色彩值
 * @param imageData 图像像素数据
 * @param row 像素点所在行
 * @param col 像素点所在列
 * @returns 像素点色值(RGBA)
 */
const getPixelRGBA = (imageData: ImageData, row: number, col: number) => {
  const { data, width } = imageData
  const index = row * width * 4 + col * 4
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    // 这里为了保证透明度数值准确度，不转化为[0, 1]范围
    a: data[index + 3],
  }
}

export default getPixelRGBA
