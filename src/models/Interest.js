const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Interest = sequelize.define(
  'Interest',
  {},
  {
    tableName: 'interests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Interest
