const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Bookmark = sequelize.define(
  'Bookmark',
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
    },
    CollectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    tableName: 'bookmarks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Bookmark
