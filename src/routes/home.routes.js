const express = require('express')
const router = express.Router()
const controller = require('../controllers/home.controller')
const { authRequired } = require('../middlewares/authMiddleware')

router.get('/', controller.getHome)

module.exports = router
