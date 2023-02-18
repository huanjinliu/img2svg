
/**
 * 将图像转化为svg图像
 * @param image 图像节点
 * @returns 
 */
const image2svg = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(image, 0, 0)

  return canvas.toDataURL('png')
};

export default image2svg
