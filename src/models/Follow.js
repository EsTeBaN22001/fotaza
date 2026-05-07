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
    updatedAt: false, // No necesitamos fecha de actualización en un follow
    indexes: [
      { unique: true, fields: ['follower_id', 'following_id'] } // ✅ Cumple: "evitar seguir al mismo usuario más de una vez"
    ]
  }
)

module.exports = Follow
