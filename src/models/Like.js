const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Like = sequelize.define(
  'Like',
  {
    UserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    PostId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  },
  {
    tableName: 'likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Like
