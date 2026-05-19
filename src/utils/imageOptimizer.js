const sharp = require('sharp')

const optimizeImage = async (buffer, options = {}) => {
  const { width = 1920, height = 1920, quality = 80 } = options

  return await sharp(buffer)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer()
}

module.exports = { optimizeImage }
