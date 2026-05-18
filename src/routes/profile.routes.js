const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const { sanitizeUsername } = require('../middlewares/validators/userValidators')
const profileController = require('../controllers/profile.controller')
const postController = require('../controllers/post.controller')

router.get('/my-posts', authRequired, profileController.getMyPosts)

const bookmarkController = require('../controllers/bookmark.controller')
router.get('/saved', authRequired, bookmarkController.getSaved)

const upload = require('../middlewares/uploadMiddleware')

router.get('/edit/:id', authRequired, postController.showEditForm)
router.post('/edit/:id', authRequired, upload.array('newImages', 5), postController.updatePost)

router.post('/delete/:id', authRequired, postController.deletePost)

router.get('/me', authRequired, (req, res) => res.redirect(`/profile/${req.user.username}`))

router.get('/:username', authRequired, sanitizeUsername, profileController.getProfile)
router.get('/:username/followers', authRequired, sanitizeUsername, profileController.getFollowersList)
router.get('/:username/following', authRequired, sanitizeUsername, profileController.getFollowingList)

router.post('/:username/follow', authRequired, sanitizeUsername, profileController.toggleFollow)

module.exports = router
