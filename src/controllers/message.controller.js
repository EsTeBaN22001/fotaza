const { Message, User, Interest, Post, PostImage } = require('../models')
const { Op, literal } = require('sequelize')
const notificationService = require('../services/notificationService')

exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'username'] },
        { model: User, as: 'Receiver', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'DESC']]
    })

    const conversationsMap = new Map()
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === userId ? msg.Receiver : msg.Sender

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          otherUser,
          lastMessage: msg,
          unreadCount: 0
        })
      }

      if (msg.receiverId === userId && !msg.is_read) {
        conversationsMap.get(otherId).unreadCount++
      }
    }

    const conversations = Array.from(conversationsMap.values())

    res.render('pages/messages/inbox', {
      title: 'Mensajes',
      conversations
    })
  } catch (err) {
    console.error('❌ Error cargando bandeja de mensajes:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar los mensajes',
      errors: [{ message: err.message }]
    })
  }
}

exports.getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const otherUserId = parseInt(req.params.userId)

    if (currentUserId === otherUserId) {
      return res.redirect('/messages')
    }

    const otherUser = await User.findByPk(otherUserId, {
      attributes: ['id', 'username', 'email', 'created_at']
    })

    if (!otherUser) {
      return res.status(404).render('pages/error', {
        message: 'Usuario no encontrado',
        errors: []
      })
    }

    // Verificar que hay un vínculo de interés entre estos usuarios
    // (uno expresó interés en el post del otro, o viceversa)
    const hasInterestLink = await checkInterestLink(currentUserId, otherUserId)

    if (!hasInterestLink) {
      return res.status(403).render('pages/error', {
        message:
          'Solo podés contactar usuarios que hayan expresado interés en tus publicaciones, o en cuyas publicaciones hayas expresado interés.',
        errors: []
      })
    }

    // Marcar como leídos los mensajes no leídos del otro usuario hacia el actual
    await Message.update(
      { is_read: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          is_read: false
        }
      }
    )

    // Cargar todos los mensajes entre ambos usuarios
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'username'] }],
      order: [['created_at', 'ASC']]
    })

    // Obtener los posts relacionados con el interés para contexto
    const relatedInterests = await getRelatedInterests(currentUserId, otherUserId)

    res.render('pages/messages/conversation', {
      title: `Conversación con ${otherUser.username}`,
      otherUser,
      messages,
      relatedInterests
    })
  } catch (err) {
    console.error('❌ Error cargando conversación:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar la conversación',
      errors: [{ message: err.message }]
    })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const receiverId = parseInt(req.params.userId)
    const { content } = req.body

    if (senderId === receiverId) {
      return res.redirect('/messages')
    }

    if (!content || content.trim().length === 0) {
      return res.redirect(`/messages/${receiverId}?error=El+mensaje+no+puede+estar+vacío`)
    }

    if (content.trim().length > 2000) {
      return res.redirect(`/messages/${receiverId}?error=El+mensaje+es+demasiado+largo+(máximo+2000+caracteres)`)
    }

    const receiver = await User.findByPk(receiverId)
    if (!receiver) {
      return res.redirect('/messages')
    }

    // Verificar vínculo de interés
    const hasInterestLink = await checkInterestLink(senderId, receiverId)
    if (!hasInterestLink) {
      return res.redirect(`/messages?error=No+tenés+permiso+para+enviar+mensajes+a+este+usuario`)
    }

    await Message.create({
      content: content.trim(),
      senderId,
      receiverId
    })

    // Notificar al receptor
    await notificationService.createNotification({
      receiverId,
      actorId: senderId,
      type: 'NEW_MESSAGE',
      relatedId: null,
      message: 'te ha enviado un mensaje privado.'
    })

    return res.redirect(`/messages/${receiverId}`)
  } catch (err) {
    console.error('❌ Error enviando mensaje:', err)
    return res.redirect(`/messages/${req.params.userId}?error=Error+al+enviar+el+mensaje`)
  }
}

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
