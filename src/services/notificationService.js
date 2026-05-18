const { Notification } = require('../models')

/**
 * Servicio centralizado para crear notificaciones en la plataforma.
 * Contiene reglas anti-spam (como no notificarse a uno mismo).
 */
exports.createNotification = async ({ receiverId, actorId, type, relatedId, message }) => {
  try {
    // 1. Regla Anti-Spam: No auto-notificarse
    if (actorId && receiverId === actorId) {
      return null
    }

    // 2. Mensajes por defecto según el tipo de evento
    let finalMessage = message || 'Tienes una nueva notificación'

    switch (type) {
      case 'COMMENT_CREATED':
        finalMessage = 'ha comentado tu publicación.'
        break
      case 'POST_LIKED':
        finalMessage = 'le ha gustado tu publicación.'
        break
      case 'USER_FOLLOWED':
        finalMessage = 'ha comenzado a seguirte.'
        break
      case 'PUBLICATION_INTERESTED':
        finalMessage = 'ha guardado tu publicación.'
        break
      
      // Tipos administrativos / Moderación
      case 'POST_UNDER_REVIEW':
        finalMessage = message || 'Tu publicación está bajo revisión por múltiples denuncias.'
        break
      case 'COMMENT_REPORTED':
        finalMessage = message || 'Uno de tus comentarios ha sido reportado.'
        break
      case 'PUBLICATION_REMOVED':
        finalMessage = message || 'Una de tus publicaciones ha sido removida.'
        break
    }

    // 3. Crear la notificación
    const notification = await Notification.create({
      UserId: receiverId,
      actorId: actorId || null,
      type,
      relatedId: relatedId || null,
      message: finalMessage
    })

    return notification
  } catch (error) {
    console.error('Error en notificationService:', error)
    // Silenciamos el error para no romper el flujo principal de la acción del usuario
    return null
  }
}
