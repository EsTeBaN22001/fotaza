const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Post = sequelize.define(
  'Post',
  {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    commentsEnabled: DataTypes.BOOLEAN
  },
  {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Post
