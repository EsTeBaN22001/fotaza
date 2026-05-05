const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Comment = sequelize.define(
  'Comment',
  {
    content: DataTypes.TEXT
  },
  {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Comment
