const express = require('express')
const router = express.Router()

const controller = require('../controllers/post.controller')
const { authRequired } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')

// vista crear
router.get('/create', authRequired, controller.showCreate)

// crear
router.post('/', authRequired, upload.array('images', 5), controller.createPost)

// 📄 ver publicación individual
router.get('/:id', controller.showPost)

// 💬 comentarios
router.post('/:id/comments', authRequired, controller.createComment)
router.post('/:id/comments/:commentId/delete', authRequired, controller.deleteComment)

// ❤️ likes
router.post('/:id/like', authRequired, controller.toggleLike)

module.exports = router

