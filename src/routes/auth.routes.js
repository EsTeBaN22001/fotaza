const express = require('express')
const router = express.Router()

const controller = require('../controllers/auth.controller')
const { sanitizeRegisterUser, sanitizeLoginUser } = require('../middlewares/validators/authValidators')

const { validateInputs } = require('../middlewares/validateInputs')

router.get('/login', controller.getLogin)

router.post('/login', sanitizeLoginUser, validateInputs('pages/login'), controller.postlogin)

router.get('/register', controller.getRegister)
router.post('/register', sanitizeRegisterUser, validateInputs('pages/register'), controller.postRegister)

router.get('/logout', controller.logout)

module.exports = router
