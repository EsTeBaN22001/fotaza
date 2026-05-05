const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Report = sequelize.define(
  'Report',
  {
    reason: DataTypes.STRING,
    description: DataTypes.TEXT
  },
  {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Report
