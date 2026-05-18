const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Report = sequelize.define(
  'Report',
  {
    targetType: {
      type: DataTypes.ENUM('post', 'postImage', 'comment'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM(
        'SPAM',
        'CONTENIDO_INAPROPIADO',
        'DESNUDEZ',
        'VIOLENCIA',
        'DISCURSO_DE_ODIO',
        'COPYRIGHT',
        'ACOSO',
        'ESTAFA',
        'INFORMACION_FALSA',
        'OTRO'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    resolutionNotes: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

module.exports = Report
