require('dotenv').config()
const express = require('express')
const path = require('path')
const sequelize = require('./config/db')
const cookieParser = require('cookie-parser')

const indexRoutes = require('./routes/index.routes')
const authRoutes = require('./routes/auth.routes')
const homeRoutes = require('./routes/home.routes')
const postRoutes = require('./routes/post.routes')
const profileRoutes = require('./routes/profile.routes')

const { attachUser } = require('./middlewares/authMiddleware')

const app = express()

// 🎨 View Engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 🍪 Cookies (primero para que esté disponible en todo el flujo)
app.use(cookieParser())

// 📦 Parsers de cuerpo (¡CRÍTICO: antes de method-override!)
app.use(express.urlencoded({ extended: true }))
// app.use(express.json()) // ✅ Recomendado para APIs o payloads JSON

// 📁 Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// 🔐 Auth Middleware + Locals globales para vistas
app.use(attachUser)
// app.use((req, res, next) => {
//   // console.log('🔍 DEBUG: req.user =', req.user?.username || 'null') // 👈 Agrega esto temporalmente
//   res.locals.user = req.user || null
//   next()
// })

// 🗺️ Rutas (¡SIEMPRE al final!)
app.use(indexRoutes)
app.use('/auth', authRoutes)
app.use('/home', homeRoutes)
app.use('/posts', postRoutes)
app.use('/profile', profileRoutes)

// 🚀 Iniciar servidor después de sincronizar BD
sequelize
  .sync()
  .then(() => {
    console.log('✅ Base de datos sincronizada')
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`)
    })
  })
  .catch(err => {
    console.error('❌ Error sincronizando BD:', err)
    process.exit(1) // Salir con error si la BD no está disponible
  })

// ❌ Manejo de errores 404 (opcional pero recomendado)
app.use((req, res) => {
  res.status(404).render('pages/error', {
    message: 'Página no encontrada',
    errors: [] // Compatible con tu layout
  })
})

// ❌ Manejo de errores globales (catch-all)
app.use((err, req, res, next) => {
  console.error('💥 Error no capturado:', err)
  res.status(500).render('pages/error', {
    message: 'Error interno del servidor',
    errors: [{ message: err.message }]
  })
})
