import imageToSvg from 'image-to-svg';

const main = () => {
  const sourceImage = document.querySelector('#source') as HTMLImageElement
  const effect = document.querySelector('#effect') as HTMLDivElement

  // sourceImage.onload = () => {
  const result = imageToSvg(sourceImage)
  if (result) {
    const { canvas, svg } = result
    // sourceImage.src = canvas.toDataURL()
    effect.appendChild(svg)
  }
  // }
}

main()
