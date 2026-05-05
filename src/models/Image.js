const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Image = sequelize.define('Image', {
  url: DataTypes.STRING,
  license: DataTypes.ENUM('copyright', 'free'),
  watermark: DataTypes.STRING
})

module.exports = Image
