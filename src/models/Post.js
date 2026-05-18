const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Post = sequelize.define(
  'Post',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'reported', 'under_review', 'removed'),
      defaultValue: 'approved'
    },
    commentsEnabled: DataTypes.BOOLEAN
  },
  {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_posts_status',
        fields: ['status']
      },
      {
        name: 'idx_posts_user_id',
        fields: ['UserId']
      },
      {
        name: 'idx_posts_created_at',
        fields: ['created_at']
      }
    ]
  }
)

module.exports = Post
