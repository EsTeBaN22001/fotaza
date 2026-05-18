const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const { authRequired } = require('../middlewares/authMiddleware')

router.use(authRequired)

router.get('/', notificationController.getNotifications)
router.post('/read-all', notificationController.markAllAsRead)
router.post('/:id/read', notificationController.markAsRead)
router.post('/:id/delete', notificationController.deleteNotification)

module.exports = router
