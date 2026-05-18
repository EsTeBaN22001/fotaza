const multer = require('multer')

// Configurar multer con almacenamiento en memoria (RAM)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato no permitido. Solo JPG, PNG o WebP'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // Límite de tamaño de archivo (20MB)
  }
})

module.exports = upload
