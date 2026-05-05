const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const PostImage = sequelize.define(
  'Image',
  {
    url: DataTypes.STRING,
    license: DataTypes.ENUM('copyright', 'free'),
    watermark: DataTypes.STRING
  },
  {
    tableName: 'images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = PostImage
