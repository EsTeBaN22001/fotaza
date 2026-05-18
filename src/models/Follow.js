const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Follow = sequelize.define(
  'Follow',
  {
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    tableName: 'follows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['follower_id', 'following_id'] }
    ]
  }
)

module.exports = Follow
