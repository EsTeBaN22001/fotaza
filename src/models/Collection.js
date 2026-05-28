const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Collection = sequelize.define(
  'Collection',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'collections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Collection
