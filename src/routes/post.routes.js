const express = require('express')
const router = express.Router()

const controller = require('../controllers/post.controller')
const bookmarkController = require('../controllers/bookmark.controller')
const { authRequired } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')

router.get('/create', authRequired, controller.showCreate)

router.post('/', authRequired, upload.array('images', 5), controller.createPost)

router.get('/:id', authRequired, controller.showPost)

router.post('/:id/comments', authRequired, controller.createComment)
router.post('/:id/comments/:commentId/delete', authRequired, controller.deleteComment)

router.post('/:id/like', authRequired, controller.toggleLike)

router.post('/:id/save', authRequired, bookmarkController.toggleBookmark)

module.exports = router

