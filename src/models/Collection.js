const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Collection = sequelize.define(
  'Collection',
  {
    name: DataTypes.STRING
  },
  {
    tableName: 'collections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Collection
