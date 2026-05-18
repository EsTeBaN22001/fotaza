const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Tag = sequelize.define(
  'Tag',
  {
    name: DataTypes.STRING
  },
  {
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_tags_name',
        fields: ['name']
      }
    ]
  }
)

module.exports = Tag
