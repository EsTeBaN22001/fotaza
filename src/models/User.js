const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const User = sequelize.define(
  'User',
  {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: {
      type: DataTypes.ENUM('user', 'validator'),
      defaultValue: 'user'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_users_username',
        fields: ['username']
      },
      {
        name: 'idx_users_active',
        fields: ['active']
      }
    ]
  }
)

module.exports = User
