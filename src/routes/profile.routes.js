const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const { sanitizeUsername } = require('../middlewares/validators/userValidators')
const profileController = require('../controllers/profile.controller')
const bookmarkController = require('../controllers/bookmark.controller')

router.get('/my-posts', authRequired, profileController.getMyPosts)
router.get('/saved', authRequired, bookmarkController.getSaved)

router.get('/me', authRequired, (req, res) => res.redirect(`/profile/${req.user.username}`))

router.get('/:username', authRequired, sanitizeUsername, profileController.getProfile)
router.get('/:username/followers', authRequired, sanitizeUsername, profileController.getFollowersList)
router.get('/:username/following', authRequired, sanitizeUsername, profileController.getFollowingList)

router.post('/:username/follow', authRequired, sanitizeUsername, profileController.toggleFollow)

router.put('/saved/:postId/collection', authRequired, bookmarkController.updateBookmarkCollection)

module.exports = router
