const sharp = require('sharp')

/**
 * Optimiza una imagen en memoria (redimensión y conversión a WebP).
 * @param {Buffer} buffer - Buffer binario de la imagen original.
 * @param {Object} options - Opciones de optimización (width, height, quality).
 * @returns {Promise<Buffer>} Buffer binario de la imagen optimizada en WebP.
 */
const optimizeImage = async (buffer, options = {}) => {
  const { width = 1920, height = 1920, quality = 80 } = options

  return await sharp(buffer)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer()
}

module.exports = { optimizeImage }
