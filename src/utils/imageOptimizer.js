const sharp = require('sharp')
const path = require('path')

const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const { width = 1920, height = 1920, quality = 80 } = options

  await sharp(inputPath)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath)
}

module.exports = { optimizeImage }
