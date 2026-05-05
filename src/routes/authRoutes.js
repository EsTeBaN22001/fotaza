const express = require('express')
const router = express.Router()
const controller = require('../controllers/authController')

router.get('/login', controller.showLogin)
router.post('/login', controller.login)

module.exports = router
