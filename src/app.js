require('dotenv').config()
const express = require('express')
const path = require('path')
const sequelize = require('./config/db')
const cookieParse = require('cookie-parse')

const authRoutes = require('./routes/authRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(authRoutes)

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log('Server running')
  })
})
