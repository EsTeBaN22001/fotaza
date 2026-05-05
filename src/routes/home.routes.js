const express = require('express')
const router = express.Router()
const controller = require('../controllers/home.controller')

router.get('/', controller.getHome)

module.exports = router
