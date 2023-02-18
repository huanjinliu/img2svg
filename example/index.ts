import imageToSvg from 'image-to-svg';

const main = () => {
  const sourceImage = document.querySelector('#source') as HTMLImageElement
  const effect = document.querySelector('#effect') as HTMLDivElement

  const svg = imageToSvg(sourceImage)
  if (svg) effect.appendChild(svg)
}

main()
