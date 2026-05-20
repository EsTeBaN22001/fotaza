const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Interest = sequelize.define(
  'Interest',
  {
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
    tableName: 'interests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'PostId'],
        name: 'unique_user_post_interest'
      }
    ]
  }
)

module.exports = Interest
