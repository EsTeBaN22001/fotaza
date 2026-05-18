const express = require('express')
const router = express.Router()
const { PostImage } = require('../models')

/**
 * GET /images/:id
 * Sirve dinámicamente el buffer binario de una imagen almacenada en la base de datos.
 */
router.get('/:id', async (req, res) => {
  try {
    const image = await PostImage.findByPk(req.params.id)
    if (!image || !image.imageData) {
      return res.status(404).send('Imagen no encontrada')
    }

    // Configurar Content-Type y Cacheo HTTP a 1 año
    res.set('Content-Type', image.mimeType || 'image/jpeg')
    res.set('Cache-Control', 'public, max-age=31536000')

    return res.send(image.imageData)
  } catch (err) {
    console.error('❌ Error en GET /images/:id:', err)
    return res.status(500).send('Error interno al cargar la imagen')
  }
})

module.exports = router
