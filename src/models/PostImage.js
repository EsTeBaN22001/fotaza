const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const PostImage = sequelize.define(
  'Image',
  {
    // Atributo virtual para compatibilidad total hacia atrás
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/images/${this.id}`
      }
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageData: {
      type: DataTypes.BLOB('long'),
      allowNull: false
    },
    originalData: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    license: {
      type: DataTypes.ENUM('copyright', 'free'),
      allowNull: false,
      defaultValue: 'copyright'
    },
    watermark: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_images_license',
        fields: ['license']
      }
    ]
  }
)

module.exports = PostImage
