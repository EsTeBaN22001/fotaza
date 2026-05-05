const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Follow = sequelize.define(
  'Follow',
  {},
  {
    tableName: 'follows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Follow
