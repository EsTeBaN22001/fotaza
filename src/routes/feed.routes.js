const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const feedController = require('../controllers/feed.controller')

router.get('/', authRequired, feedController.getFollowedFeed)
module.exports = router
