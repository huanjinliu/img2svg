import imageToSvg from 'image-to-svg';

const main = () => {
  const sourceImage = document.querySelector('#source') as HTMLImageElement
  const effect = document.querySelector('#effect') as HTMLDivElement

  let zoom = 1
  let offset = {
    x: 0,
    y: 0
  }
  let initPos: { x: number; y: number } | undefined;
  let movePos: { x: number; y: number } | undefined;

  const transform = (options: { zoom?: number, offset?: typeof offset } = {}) => {
    if (options.zoom) zoom = options.zoom
    if (options.offset) offset = options.offset

    const style = `
      transform: scale(${zoom}) translate(${offset.x}px, ${offset.y}px);
      cursor: ${movePos ? 'grabbing' : `grab`};
    `

    effect.setAttribute('style', style)
    sourceImage.setAttribute('style', style)
  }

  // sourceImage.onload = () => {
  const result = imageToSvg(sourceImage)
  if (result) {
    const { canvas, svg } = result
    // sourceImage.src = canvas.toDataURL()
    effect.appendChild(svg)
  }
  // }

  effect.onwheel = (e) => {
    const dZoom = 0.999 ** (e.deltaY / 2);
    transform({ zoom: zoom * dZoom })
  }

  effect.onmousedown = (e) => {
    initPos = offset
    movePos = { x: e.x, y: e.y }
  }
  effect.onmouseup = () => {
    initPos = undefined
    movePos = undefined
    transform()
  }
  effect.onmousemove = (e) => {
    if (movePos) {
      transform({
        offset: {
          x: (initPos ?? offset).x + (e.x - movePos.x) / zoom,
          y: (initPos ?? offset).y + (e.y - movePos.y) / zoom,
        }
      })
    }
  }
}

main()
