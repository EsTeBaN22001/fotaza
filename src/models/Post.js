const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Post = sequelize.define(
  'Post',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'approved'
    },
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
