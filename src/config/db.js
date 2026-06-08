require('dotenv').config()
const { Sequelize } = require('sequelize')

const dialectOptions = {}
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    rejectUnauthorized: false
  }
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: process.env.DB_TIMEZONE || '-03:00',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: 30000,
    idle: 10000
  }
})

module.exports = sequelize
