const express = require('express')
const router = express.Router()

const controller = require('../controllers/post.controller')
const bookmarkController = require('../controllers/bookmark.controller')
const interestController = require('../controllers/interest.controller')
const { authRequired } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')

router.get('/create', authRequired, controller.showCreate)

router.post('/', authRequired, upload.array('images', 5), controller.createPost)

router.get('/:id', authRequired, controller.showPost)

router.get('/:id/edit', authRequired, controller.showEditForm)
router.post('/:id/edit', authRequired, upload.array('newImages', 5), controller.updatePost)

router.post('/:id/delete', authRequired, controller.deletePost)

router.post('/:id/comments', authRequired, controller.createComment)
router.post('/:id/comments/:commentId/delete', authRequired, controller.deleteComment)

router.post('/:id/like', authRequired, controller.toggleLike)

router.post('/:id/save', authRequired, bookmarkController.toggleBookmark)

router.post('/:id/rate', authRequired, controller.ratePost)

router.post('/:id/interest', authRequired, interestController.toggleInterest)
router.get('/:id/interest/status', authRequired, interestController.getInterestStatus)

module.exports = router
