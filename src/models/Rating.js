const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Rating = sequelize.define(
  'Rating',
  {
    value: DataTypes.INTEGER
  },
  {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Rating
