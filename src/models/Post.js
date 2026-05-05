const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  commentsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
})

module.exports = Post
