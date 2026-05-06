require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  // Muestra queries solo en desarrollo
  // logging: process.env.NODE_ENV === 'development' ? console.log : false,
  logging: false,
  // Alinea fechas con Argentina/Latam (ajustá si es necesario)
  timezone: process.env.DB_TIMEZONE || '-03:00',
  // Pool optimizado para concurrencia moderada/alta
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: 30000,
    idle: 10000
  }
  // Opcional: necesario si tu hosting exige SSL (Railway, Render, Supabase, etc.)
  // dialectOptions: process.env.DB_SSL === 'true'
  //   ? { ssl: { rejectUnauthorized: false } }
  //   : {}
})

module.exports = sequelize
