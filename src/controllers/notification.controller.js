const { Notification, User } = require('../models')

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const offset = (page - 1) * limit

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { UserId: req.user.id },
      include: [
        { model: User, as: 'Actor', attributes: ['id', 'username', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    const totalPages = Math.ceil(count / limit)

    const unreadCount = await Notification.count({
      where: { UserId: req.user.id, is_read: false }
    })

    res.render('pages/notifications/index', {
      notifications,
      currentPage: page,
      totalPages,
      totalNotifications: count,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).render('pages/error', { message: 'Error al cargar las notificaciones' })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' })
    }

    notification.is_read = true
    await notification.save()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Error interno' })
  }
}

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { UserId: req.user.id, is_read: false } }
    )

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(200).json({ success: true })
    }

    res.redirect('/notifications')
  } catch (error) {
    console.error('Error marking all as read:', error)
    res.status(500).render('pages/error', { message: 'Error interno al marcar todo como leído' })
  }
}

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' })
    }

    await notification.destroy()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Error interno' })
  }
}
