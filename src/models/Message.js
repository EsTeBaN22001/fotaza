const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Message = sequelize.define(
  'Message',
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_messages_sender',
        fields: ['senderId']
      },
      {
        name: 'idx_messages_receiver',
        fields: ['receiverId']
      }
    ]
  }
)

module.exports = Message
