const sharp = require('sharp')

const applyWatermark = async (imageBuffer, watermarkText) => {
  if (!watermarkText || watermarkText.trim() === '') {
    return imageBuffer
  }

  const text = watermarkText.trim()
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 800
  const height = metadata.height || 600
  const fontSize = Math.max(16, Math.min(42, Math.floor(width / 18)))
  const angle = -30
  const color = 'rgba(255,255,255,0.45)'
  const stepX = 450
  const stepY = 220
  const repeatX = Math.ceil(width / stepX) + 2
  const repeatY = Math.ceil(height / stepY) + 2

  let textElements = ''
  for (let row = -1; row < repeatY; row++) {
    for (let col = -1; col < repeatX; col++) {
      const x = col * stepX + (row % 2 === 0 ? 0 : stepX / 2)
      const y = row * stepY
      textElements += `<text
        x="${x}"
        y="${y}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="${color}"
        transform="rotate(${angle}, ${x}, ${y})"
        dominant-baseline="middle"
        text-anchor="middle"
      >${text}</text>`
    }
  }

  const svgOverlay = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
  >
    <defs>
      <style>text { user-select: none; }</style>
    </defs>
    ${textElements}
  </svg>`

  // Componer la imagen original con el overlay SVG
  const result = await sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ])
    .webp({ quality: 80 })
    .toBuffer()

  return result
}

module.exports = { applyWatermark }
