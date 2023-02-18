import imageToSvg from 'image-to-svg';

const main = () => {
  const sourceImage = document.querySelector('#source') as HTMLImageElement
  const effectImage = document.querySelector('#effect') as HTMLImageElement

  effectImage.src = imageToSvg(sourceImage)
}

main()
