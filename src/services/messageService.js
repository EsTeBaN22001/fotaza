const { Interest, Post, PostImage } = require('../models')
const { Op } = require('sequelize')

/**
 * Verifica si hay un vínculo de interés entre dos usuarios
 * (uno expresó interés en el post del otro, o viceversa)
 */
async function checkInterestLink(userAId, userBId) {
  // Posts de userB donde userA expresó interés
  const interestAonB = await Interest.findOne({
    where: { UserId: userAId },
    include: [
      {
        model: Post,
        where: { UserId: userBId },
        required: true
      }
    ]
  })

  if (interestAonB) return true

  // Posts de userA donde userB expresó interés
  const interestBonA = await Interest.findOne({
    where: { UserId: userBId },
    include: [
      {
        model: Post,
        where: { UserId: userAId },
        required: true
      }
    ]
  })

  return !!interestBonA
}

/**
 * Obtiene los posts relacionados con el interés entre dos usuarios para contexto
 */
async function getRelatedInterests(userAId, userBId) {
  const interests = await Interest.findAll({
    where: {
      [Op.or]: [{ UserId: userAId }, { UserId: userBId }]
    },
    include: [
      {
        model: Post,
        where: {
          [Op.or]: [{ UserId: userAId }, { UserId: userBId }]
        },
        required: true,
        include: [{ model: PostImage, as: 'images', limit: 1 }]
      }
    ]
  })

  return interests
}

module.exports = {
  checkInterestLink,
  getRelatedInterests
}
