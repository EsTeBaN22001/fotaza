const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Notification = sequelize.define(
  'Notification',
  {
    type: DataTypes.STRING,
    message: { type: DataTypes.STRING, allowNull: true },
    relatedId: { type: DataTypes.INTEGER, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Notification
