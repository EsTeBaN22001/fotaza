const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const { authRequired } = require('../middlewares/authMiddleware')

// Protegemos todas las rutas
router.use(authRequired)

// 📋 Ver listado
router.get('/', notificationController.getNotifications)

// ✅ Marcar todas como leídas
router.post('/read-all', notificationController.markAllAsRead)

// ✅ Marcar una como leída (vía AJAX)
router.post('/:id/read', notificationController.markAsRead)

// 🗑️ Eliminar una notificación (vía AJAX)
router.post('/:id/delete', notificationController.deleteNotification)

module.exports = router
