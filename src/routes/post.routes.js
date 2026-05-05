const express = require('express')
const router = express.Router()

const controller = require('../controllers/post.controller')
const { authRequired } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')

// vista
router.get('/create', authRequired, controller.showCreate)

// crear
router.post('/', authRequired, upload.array('images', 5), controller.createPost)

module.exports = router
