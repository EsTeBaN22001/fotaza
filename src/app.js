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
const feedRoutes = require('./routes/feed.routes')
const reportRoutes = require('./routes/report.routes')
const moderatorRoutes = require('./routes/moderator.routes')
const notificationRoutes = require('./routes/notification.routes')

const { attachUser } = require('./middlewares/authMiddleware')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(cookieParser())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

app.use(attachUser)

app.use(indexRoutes)
app.use('/auth', authRoutes)
app.use('/home', homeRoutes)
app.use('/posts', postRoutes)
app.use('/profile', profileRoutes)
app.use('/feed', feedRoutes)
app.use('/reports', reportRoutes)
app.use('/moderator', moderatorRoutes)
app.use('/notifications', notificationRoutes)

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
    process.exit(1)
  })

app.use((req, res) => {
  res.status(404).render('pages/error', {
    message: 'Página no encontrada',
    errors: []
  })
})

app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'

  console.error(`💥 [${status}] Error:`, err.message)

  if (status === 401) {
    return res.status(401).render('pages/unauthorized', {
      title: 'Acceso Restringido',
      returnTo: req.originalUrl
    })
  }

  res.status(status).render('pages/error', {
    status,
    message: status === 500 ? 'Algo salió mal en nuestro servidor' : message,
    errors: process.env.NODE_ENV === 'development' ? [{ message: err.message }] : []
  })
})
