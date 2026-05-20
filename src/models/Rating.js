const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Rating = sequelize.define(
  'Rating',
  {
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PostId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'PostId'],
        name: 'unique_user_post_rating'
      }
    ]
  }
)

module.exports = Rating
