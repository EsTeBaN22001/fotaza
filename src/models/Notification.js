const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Notification = sequelize.define(
  'Notification',
  {
    type: DataTypes.STRING,
    is_read: DataTypes.BOOLEAN
  },
  {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Notification
