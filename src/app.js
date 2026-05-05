require('dotenv').config()
const express = require('express')
const path = require('path')
const sequelize = require('./config/db')
const cookieParser = require('cookie-parser')

const indexRoutes = require('./routes/index.routes')
const authRoutes = require('./routes/auth.routes')
const homeRoutes = require('./routes/home.routes')
const { attachUser } = require('./middlewares/authMiddleware')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(attachUser)
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

app.use(indexRoutes)
app.use('/auth', authRoutes)
app.use('/home', homeRoutes)

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log('Server running')
  })
})
