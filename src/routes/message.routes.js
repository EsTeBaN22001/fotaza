const express = require('express')
const router = express.Router()
const messageController = require('../controllers/message.controller')
const { authRequired } = require('../middlewares/authMiddleware')

router.use(authRequired)

router.get('/', messageController.getInbox)
router.get('/:userId', messageController.getConversation)
router.post('/:userId', messageController.sendMessage)

module.exports = router
