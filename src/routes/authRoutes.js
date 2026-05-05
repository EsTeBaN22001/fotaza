const express = require('express')
const router = express.Router()

const controller = require('../controllers/authController')
const { sanitizeRegisterUser, sanitizeLoginUser } = require('../middlewares/validators/authValidators')

const { validateInputs } = require('../middlewares/validateInputs')

router.get('/login', controller.showLogin)

router.post('/login', sanitizeLoginUser, validateInputs('pages/login'), controller.login)

// router.post('/register', sanitizeRegisterUser, validateInputs('pages/register'), controller.register)

module.exports = router
