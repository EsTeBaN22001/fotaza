const sharp = require('sharp')
const path = require('path')

/**
 * Optimiza una imagen y la guarda en formato WebP
 * @param {string} inputPath - Ruta absoluta del archivo original
 * @param {string} outputPath - Ruta absoluta donde se guardará la optimizada
 * @param {object} options - Configuración opcional
 */
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const { width = 1920, height = 1920, quality = 80 } = options

  await sharp(inputPath)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 6 }) // effort 6 = mejor compresión (0-6)
    .toFile(outputPath)
}

module.exports = { optimizeImage }
