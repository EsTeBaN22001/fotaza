const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const { sanitizeUsername } = require('../middlewares/validators/userValidators')
const profileController = require('../controllers/profile.controller')
const postController = require('../controllers/post.controller')

// 📸 Ver mis publicaciones
router.get('/my-posts', authRequired, profileController.getMyPosts)

// ✏️ Editar: CAMBIAR .put() POR .post()
router.get('/edit/:id', authRequired, postController.showEditForm)
router.post('/edit/:id', authRequired, postController.updatePost) // ✅ POST en lugar de PUT

// 🗑️ Eliminar: CAMBIAR .delete() POR .post()
router.post('/delete/:id', authRequired, postController.deletePost) // ✅ POST en lugar de DELETE

// profile feat
router.get('/me', authRequired, (req, res) => res.redirect(`/profile/${req.user.username}`))

router.get('/:username', sanitizeUsername, profileController.getProfile)
router.get('/:username/followers', sanitizeUsername, profileController.getFollowersList)
router.get('/:username/following', sanitizeUsername, profileController.getFollowingList)

router.post('/:username/follow', authRequired, sanitizeUsername, profileController.toggleFollow)

module.exports = router
